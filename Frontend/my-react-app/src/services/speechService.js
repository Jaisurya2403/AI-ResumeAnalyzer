export class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = Boolean(SpeechRecognition);
    this.recognition = null;
    this.isListening = false;
    this.transcript = "";
    this.onTranscriptChange = null;
    this.onError = null;
    this.onStateChange = null;

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChange) this.onStateChange(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (this.onError) this.onError(event.error);
      };

      this.recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + " ";
          } else {
            interim += res[0].transcript;
          }
        }

        const full = (final + interim).trim();
        this.transcript = full;
        if (this.onTranscriptChange) {
          this.onTranscriptChange(full, Boolean(interim));
        }
      };
    }
  }

  start(onTranscript, onError, onState) {
    if (!this.isSupported) {
      if (onError) onError("Web Speech API is not supported in this browser.");
      return;
    }

    this.onTranscriptChange = onTranscript;
    this.onError = onError;
    this.onStateChange = onState;
    this.transcript = "";

    try {
      this.recognition.start();
    } catch (err) {
      console.warn("Recognition already started or error:", err);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Error stopping recognition:", err);
      }
    }
  }

  reset() {
    this.stop();
    this.transcript = "";
  }
}

export const speechService = new SpeechRecognitionService();
