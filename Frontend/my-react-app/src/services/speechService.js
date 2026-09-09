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
        if (this.onStateChange) {
          try { this.onStateChange(true); } catch (e) {}
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
            return;
          } catch (e) {
            // Already starting or permission check
          }
        }
        this.isListening = false;
        if (this.onStateChange) {
          try { this.onStateChange(false); } catch (e) {}
        }
      };

      this.recognition.onerror = (event) => {
        if (event?.error === 'no-speech' || event?.error === 'aborted') {
          return;
        }
        console.warn("Speech recognition event error:", event?.error);
        if (this.onError) {
          try { this.onError(event?.error || 'speech_error'); } catch (e) {}
        }
      };

      this.recognition.onresult = (event) => {
        try {
          if (!event || !event.results) return;
          let interim = "";
          let final = "";

          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (!res || !res[0]) continue;
            const transcriptChunk = res[0].transcript || "";
            if (res.isFinal) {
              final += transcriptChunk + " ";
            } else {
              interim += transcriptChunk;
            }
          }

          const base = (this.baseTranscript || "").trim();
          const spoken = (final + interim).trim();
          const full = base ? (spoken ? `${base} ${spoken}` : base) : spoken;
          this.transcript = full;
          if (this.onTranscriptChange) {
            this.onTranscriptChange(full, Boolean(interim));
          }
        } catch (err) {
          console.warn("Error processing speech result:", err);
        }
      };
    }
  }

  start(onTranscript, onError, onState, initialText = "") {
    if (!this.isSupported) {
      if (onError) onError("Web Speech API is not supported in this browser.");
      return;
    }

    this.onTranscriptChange = onTranscript;
    this.onError = onError;
    this.onStateChange = onState;
    this.baseTranscript = initialText || "";
    this.isListening = true;

    try {
      this.recognition.start();
    } catch (err) {
      // Recognition may already be running
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Safe ignore
      }
    }
  }

  abort() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        // Safe ignore
      }
    }
  }

  reset() {
    this.stop();
    this.transcript = "";
  }
}

export const speechService = new SpeechRecognitionService();
