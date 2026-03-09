import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import VoiceToggle from "@/components/VoiceToggle";

interface FloatingChatBarProps {
  onSubmit: (message: string) => void;
}

const FloatingChatBar = ({ onSubmit }: FloatingChatBarProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <motion.div
      layoutId="chat-input-container"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.6 }}
    >
      <div className="glass rounded-2xl shadow-[var(--shadow-elevated)] border border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-foreground" />
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="What are you looking to build?"
            className="flex-1 bg-transparent text-sm font-sans outline-none text-foreground placeholder:text-muted-foreground"
          />
          <VoiceToggle onTranscript={(t) => onSubmit(t)} disabled={false} />
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-[10px] font-sans text-muted-foreground/60 tracking-wide uppercase">Try:</span>
          {["AI Support", "E-Commerce", "Automation"].map((s) => (
            <button
              key={s}
              onClick={() => onSubmit(s)}
              className="text-[10px] font-sans text-muted-foreground px-2 py-0.5 rounded-full border border-border/50 hover:bg-secondary hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingChatBar;
