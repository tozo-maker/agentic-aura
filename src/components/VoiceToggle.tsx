import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceToggleProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

const VoiceToggle = ({ onTranscript, disabled }: VoiceToggleProps) => {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<any>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          onTranscript(t.trim());
          interimText = "";
        } else {
          interimText += t;
        }
      }
      setInterim(interimText);
    };

    rec.onerror = () => stop();
    rec.onend = () => { setListening(false); setInterim(""); };

    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [onTranscript, stop]);

  useEffect(() => () => { recRef.current?.stop(); }, []);

  if (!SpeechRecognitionAPI) return null;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {listening && interim && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-xs text-muted-foreground italic truncate max-w-[120px]"
          >
            {interim}
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={listening ? stop : start}
        disabled={disabled}
        className={`relative h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          listening
            ? "text-destructive"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label={listening ? "Stop listening" : "Start voice input"}
      >
        {listening && (
          <motion.span
            className="absolute inset-0 rounded-lg bg-destructive/20"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        {listening ? <MicOff className="w-4 h-4 relative z-10" /> : <Mic className="w-4 h-4" />}
      </button>

      {listening && (
        <span className="text-[10px] font-sans text-destructive font-medium">Listening…</span>
      )}
    </div>
  );
};

export default VoiceToggle;
