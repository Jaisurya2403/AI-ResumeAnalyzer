import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, ShieldAlert, ShieldCheck, AlertTriangle, UserX, Users, Eye, EyeOff, Maximize2, Minimize2, VideoOff, Mic, MicOff, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProctoringCamera({ enableAudioDetection = true, onViolation, style = {} }) {
  const { state, dispatch } = useApp();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const faceMeshRef = useRef(null);

  // Audio VAD Refs
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const voiceBurstStartTimeRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [faceCount, setFaceCount] = useState(0);
  const [gazeStatus, setGazeStatus] = useState("aligned"); // "aligned" | "away" | "unverified"
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  // Proctoring tracking timestamps & counters (use refs to avoid interval/closure drift)
  const lastFaceSeenTimeRef = useRef(Date.now());
  const lookingAwayStartTimeRef = useRef(null);
  const lookingAwayRepeatCountRef = useRef(0);
  const lastWarningCooldownRef = useRef({});
  const tabSwitchCountRef = useRef(0);

  // Play synthetic web audio alert chime
  const playAlertChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }, []);

  // Trigger violation event with cooldown
  const triggerViolation = useCallback((type, message, points, icon) => {
    const now = Date.now();
    const lastTrigger = lastWarningCooldownRef.current[type] || 0;
    // 10 second cooldown per violation type to avoid rapid score buildup
    if (now - lastTrigger < 10000) return;
    lastWarningCooldownRef.current[type] = now;

    playAlertChime();

    const violation = {
      id: Date.now(),
      type,
      message,
      points,
      timestamp: new Date().toLocaleTimeString()
    };

    dispatch({ type: 'ADD_PROCTORING_VIOLATION', payload: violation });

    if (onViolation) {
      onViolation(violation);
    }

    setActiveToast({
      id: Date.now(),
      type,
      message,
      points,
      icon
    });

    setTimeout(() => {
      setActiveToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, [dispatch, onViolation, playAlertChime]);

  // Voice Activity Detection (VAD) Hook for Rounds 1-3
  useEffect(() => {
    if (!enableAudioDetection) {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
        audioContextRef.current = null;
      }
      setIsVoiceDetected(false);
      return;
    }

    let isMounted = true;

    async function initAudioVAD() {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });

        if (!isMounted) {
          audioStream.getTracks().forEach(t => t.stop());
          return;
        }

        audioStreamRef.current = audioStream;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        // Auto-resume AudioContext
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }

        const handleUserGesture = () => {
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
        };
        window.addEventListener('click', handleUserGesture, { passive: true });
        window.addEventListener('keydown', handleUserGesture, { passive: true });

        const source = audioCtx.createMediaStreamSource(audioStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);

        const timeBufferLength = analyser.fftSize;
        const timeData = new Float32Array(timeBufferLength);
        const freqBufferLength = analyser.frequencyBinCount;
        const freqData = new Uint8Array(freqBufferLength);

        // Adaptive noise floor calibration
        let calibrationSamples = 0;
        let ambientFloor = 0.01;
        let voiceCooldownTimeout = null;

        audioIntervalRef.current = setInterval(() => {
          if (!isMounted || !analyser) return;

          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }

          try {
            analyser.getFloatTimeDomainData(timeData);
            analyser.getByteFrequencyData(freqData);

            // Calculate RMS audio energy
            let sumSquares = 0;
            for (let i = 0; i < timeBufferLength; i++) {
              sumSquares += timeData[i] * timeData[i];
            }
            const rms = Math.sqrt(sumSquares / timeBufferLength);

            // Initial 1.2 seconds calibration of room ambient floor
            if (calibrationSamples < 8) {
              ambientFloor = Math.max(0.006, (ambientFloor * calibrationSamples + rms) / (calibrationSamples + 1));
              calibrationSamples++;
              return;
            }

            // Calculate energy in human speech frequencies (approx 250Hz to 3400Hz)
            // For sampleRate ~48kHz, bin width is ~93.75Hz -> bins 3 to 36
            let speechBandSum = 0;
            const startBin = 2;
            const endBin = Math.min(36, freqBufferLength);
            for (let i = startBin; i < endBin; i++) {
              speechBandSum += freqData[i];
            }
            const avgSpeechFreqEnergy = speechBandSum / (endBin - startBin);

            // Sensitive yet robust threshold calibrated to ambient room noise
            const SPEECH_RMS_THRESHOLD = Math.max(0.026, ambientFloor * 1.75);
            const isSpeaking = (rms > SPEECH_RMS_THRESHOLD && avgSpeechFreqEnergy > 12) || (rms > 0.045);
            const now = Date.now();

            if (isSpeaking) {
              if (!voiceBurstStartTimeRef.current) {
                voiceBurstStartTimeRef.current = now;
              } else {
                const burstDuration = now - voiceBurstStartTimeRef.current;
                // Voice detected for > 350ms (2-3 consecutive sample windows)
                if (burstDuration >= 350) {
                  setIsVoiceDetected(true);
                  if (voiceCooldownTimeout) clearTimeout(voiceCooldownTimeout);
                  voiceCooldownTimeout = setTimeout(() => {
                    if (isMounted) setIsVoiceDetected(false);
                  }, 2500);

                  triggerViolation(
                    'VOICE_DETECTED',
                    '⚠️ Voice / Speaking Detected: Please maintain complete silence during written assessment rounds.',
                    2,
                    'mic'
                  );
                  voiceBurstStartTimeRef.current = null; // reset to prevent continuous burst loops
                }
              }
            } else {
              voiceBurstStartTimeRef.current = null;
            }
          } catch (e) {}
        }, 120);

      } catch (err) {
        console.warn("Proctoring mic access check:", err);
      }
    }

    initAudioVAD();

    return () => {
      isMounted = false;
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
        audioContextRef.current = null;
      }
    };
  }, [enableAudioDetection, triggerViolation]);

  // Tab switch & Window Blur Monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        triggerViolation(
          'TAB_SWITCH',
          '⚠️ Tab Switching Detected: Please remain on the active assessment window.',
          5,
          'tab'
        );
      }
    };

    const handleWindowBlur = () => {
      triggerViolation(
        'WINDOW_BLUR',
        '⚠️ Window Focus Lost: Please keep focus on the assessment tab.',
        3,
        'tab'
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [triggerViolation]);

  // Start Webcam and MediaPipe Detection Loop
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.warn("Video play notice:", e));
          };
        }
        setCameraActive(true);
        setCameraError(null);

        // Initialize MediaPipe FaceMesh from window CDN
        if (window.FaceMesh) {
          const faceMesh = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });

          faceMesh.setOptions({
            maxNumFaces: 3,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          faceMesh.onResults((results) => {
            if (!isMounted) return;
            handleMediaPipeResults(results);
          });

          faceMeshRef.current = faceMesh;
          startFaceMeshLoop();
        } else {
          // Retry when script loads
          startFallbackLoop();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (isMounted) {
          setCameraActive(false);
          setCameraError("Webcam access required for AI Proctoring. Please allow camera permissions.");
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Ensure stream remains bound when minimizing/expanding
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn("Video play notice:", e));
    }
  }, [isMinimized]);

  // Frame processing loop for FaceMesh
  const startFaceMeshLoop = () => {
    const processFrame = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && faceMeshRef.current) {
        try {
          await faceMeshRef.current.send({ image: videoRef.current });
        } catch (err) {
          // Frame skip handling
        }
      }
      animFrameRef.current = requestAnimationFrame(processFrame);
    };
    animFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Fallback loop if FaceMesh was still loading CDN scripts
  const startFallbackLoop = () => {
    const checkInterval = setInterval(() => {
      if (window.FaceMesh && !faceMeshRef.current) {
        clearInterval(checkInterval);
        const faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        faceMesh.setOptions({ maxNumFaces: 3, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        faceMesh.onResults(handleMediaPipeResults);
        faceMeshRef.current = faceMesh;
        startFaceMeshLoop();
      }
    }, 800);
  };

  // Handle detection results from MediaPipe FaceMesh
  const handleMediaPipeResults = (results) => {
    const faces = results.multiFaceLandmarks || [];
    const count = faces.length;
    setFaceCount(count);

    const now = Date.now();

    // 1. Condition: No face detected for 5.5 to 6 seconds
    if (count === 0) {
      const noFaceDuration = now - lastFaceSeenTimeRef.current;
      setGazeStatus("unverified");

      if (noFaceDuration >= 5500) {
        triggerViolation(
          'NO_FACE',
          '⚠️ No Face Detected: Please stay centered in front of your camera.',
          4,
          'noface'
        );
      }
      return;
    }

    // Reset last face seen timestamp when 1 or more faces are present
    lastFaceSeenTimeRef.current = now;

    // 2. Condition: More than 1 face detected
    if (count > 1) {
      setGazeStatus("away");
      triggerViolation(
        'MULTIPLE_FACES',
        `⚠️ Multiple Faces Detected (${count} faces): Only the registered candidate is permitted in frame.`,
        5,
        'multiple'
      );
      return;
    }

    // 3. Condition: Single face present -> Analyze Gaze & Head Pose
    if (count === 1) {
      const landmarks = faces[0];
      const nose = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const forehead = landmarks[10];
      const chin = landmarks[152];

      if (nose && leftEye && rightEye && forehead && chin) {
        const eyeSpan = Math.abs(rightEye.x - leftEye.x) || 0.1;
        const midEyeX = (leftEye.x + rightEye.x) / 2;
        const faceHeight = Math.abs(chin.y - forehead.y) || 0.1;
        const midEyeY = (leftEye.y + rightEye.y) / 2;

        // Yaw ratio (horizontal turned left or right)
        const yawRatio = (nose.x - midEyeX) / eyeSpan;
        // Pitch ratio (vertical looking down or up)
        const pitchRatio = (nose.y - midEyeY) / faceHeight;

        // Generous angles allowing normal screen reading & typing without false alarms
        const isLookingLeftOrRight = Math.abs(yawRatio) > 0.52;
        const isLookingDownOrUp = pitchRatio < -0.20 || pitchRatio > 0.65;
        const isLookingAway = isLookingLeftOrRight || isLookingDownOrUp;

        if (isLookingAway) {
          setGazeStatus("away");
          if (!lookingAwayStartTimeRef.current) {
            lookingAwayStartTimeRef.current = now;
          } else {
            const awayDuration = now - lookingAwayStartTimeRef.current;
            // Trigger if turned away continuously for >= 5 seconds
            if (awayDuration >= 5000) {
              lookingAwayRepeatCountRef.current += 1;
              triggerViolation(
                'LOOKING_AWAY',
                '⚠️ Suspicious Head Movement / Gaze Averted: Please look directly at the screen.',
                2,
                'gaze'
              );
              lookingAwayStartTimeRef.current = now;
            }
          }
        } else {
          setGazeStatus("aligned");
          lookingAwayStartTimeRef.current = null;
        }
      }

      // Draw subtle face indicator on canvas
      drawLandmarkOverlay(landmarks);
    }
  };

  // Visual bounding overlay
  const drawLandmarkOverlay = (landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks && landmarks.length > 0) {
      const nose = landmarks[1];
      if (nose) {
        ctx.fillStyle = gazeStatus === "aligned" ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 3.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const malpracticeScore = state.malpracticeScore || 0;
  const isCheating = malpracticeScore > 50;

  return (
    <>
      {/* Floating High-Priority Warning Toast */}
      {activeToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'linear-gradient(135deg, rgba(28, 10, 10, 0.96) 0%, rgba(45, 12, 12, 0.98) 100%)',
          border: '1.5px solid #ef4444',
          borderRadius: '12px',
          padding: '1rem 1.75rem',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4), 0 0 20px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '560px',
          width: '90%',
          animation: 'shakeWarning 0.5s ease-in-out',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {activeToast.icon === 'mic' ? (
              <MicOff size={22} color="#ef4444" />
            ) : (
              <ShieldAlert size={22} color="#ef4444" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {activeToast.icon === 'mic' ? "Audio / Voice Violation" : "AI Proctoring Alert"} (+{activeToast.points} Flag Points)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 600 }}>
                Score: {malpracticeScore}/50
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600, lineHeight: '1.4' }}>
              {activeToast.message}
            </div>
          </div>
        </div>
      )}

      {/* Floating Proctoring Camera HUD Widget */}
      <div style={{
        position: 'fixed',
        top: '85px',
        right: '24px',
        zIndex: 9999,
        width: isMinimized ? '180px' : '220px',
        background: 'rgba(10, 14, 23, 0.92)',
        border: `1.5px solid ${isCheating ? '#ef4444' : (gazeStatus === 'away' ? '#f59e0b' : 'rgba(212, 175, 55, 0.5)')}`,
        borderRadius: '14px',
        boxShadow: isCheating 
          ? '0 8px 30px rgba(239, 68, 68, 0.45)' 
          : '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.15)',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        ...style
      }}>
        {/* Header HUD Bar */}
        <div style={{
          padding: '0.45rem 0.75rem',
          background: 'rgba(5, 7, 12, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: cameraActive ? (faceCount === 1 ? '#10b981' : '#ef4444') : '#64748b',
              boxShadow: cameraActive && faceCount === 1 ? '0 0 8px #10b981' : 'none'
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
              AI PROCTOR
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Background Malpractice Flag Score Indicator */}
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              background: isCheating ? 'rgba(239, 68, 68, 0.25)' : 'rgba(212, 175, 55, 0.15)',
              color: isCheating ? '#f87171' : 'var(--gold-light)',
              border: `1px solid ${isCheating ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`
            }}>
              FLAG: {malpracticeScore}/50
            </span>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isMinimized ? "Expand Camera" : "Minimize Camera"}
            >
              {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
          </div>
        </div>

        {/* Live Video Canvas Area (Kept permanently mounted to prevent stream detachment) */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMinimized ? '0px' : '145px',
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? 'none' : 'auto',
          background: '#000',
          overflow: 'hidden',
          transition: 'height 0.25s ease, opacity 0.25s ease'
        }}>
          {cameraError ? (
            <div style={{
              height: '145px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              textAlign: 'center',
              color: '#f87171',
              fontSize: '0.72rem'
            }}>
              <VideoOff size={22} style={{ marginBottom: '4px' }} />
              <span>{cameraError}</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '145px',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror display
                }}
              />
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '145px',
                  pointerEvents: 'none',
                  transform: 'scaleX(-1)'
                }}
              />

              {/* Real-time Status Overlay Badge */}
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '6px',
                right: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(5, 7, 12, 0.82)',
                backdropFilter: 'blur(6px)',
                fontSize: '0.68rem',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {faceCount === 1 ? (
                    gazeStatus === "aligned" ? (
                      <>
                        <ShieldCheck size={12} color="#10b981" />
                        <span style={{ color: '#34d399', fontWeight: 600 }}>Face Aligned</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} color="#f59e0b" />
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>Looking Away</span>
                      </>
                    )
                  ) : faceCount === 0 ? (
                    <>
                      <UserX size={12} color="#ef4444" />
                      <span style={{ color: '#f87171', fontWeight: 600 }}>No Face</span>
                    </>
                  ) : (
                    <>
                      <Users size={12} color="#ef4444" />
                      <span style={{ color: '#f87171', fontWeight: 600 }}>{faceCount} Faces</span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {enableAudioDetection && (
                    <span style={{
                      color: isVoiceDetected ? '#ef4444' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '0.62rem',
                      fontWeight: 600
                    }}>
                      {isVoiceDetected ? <VolumeX size={11} color="#ef4444" /> : <Mic size={11} color="#10b981" />}
                      {isVoiceDetected ? "Audio Alert" : "Silence VAD"}
                    </span>
                  )}
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.62rem' }}>
                    30FPS
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Minimized Status Row */}
        {isMinimized && (
          <div style={{
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem'
          }}>
            <span style={{ color: faceCount === 1 ? '#34d399' : '#f87171', fontWeight: 600 }}>
              {faceCount === 1 ? "🟢 Monitoring" : "🔴 Attention"}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              FLAG: {malpracticeScore}/50
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shakeWarning {
          0%, 100% { transform: translateX(-50%); }
          20%, 60% { transform: translateX(calc(-50% - 6px)); }
          40%, 80% { transform: translateX(calc(-50% + 6px)); }
        }
      `}</style>
    </>
  );
}
