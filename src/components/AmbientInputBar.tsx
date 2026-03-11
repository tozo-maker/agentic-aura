import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Slash, ShoppingCart, Cog, Server, Headphones } from "lucide-react";
import VoiceToggle from "@/components/VoiceToggle";

interface AmbientInputBarProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
}

const quickActions = [
  { icon: Sparkles, label: "Cut support costs by 50%", category: "AI Support" },
  { icon: Cog, label: "Automate procurement workflows", category: "Automation" },
  { icon: ShoppingCart, label: "Build a headless storefront", category: "Commerce" },
  { icon: Server, label: "Self-healing infrastructure", category: "Infrastructure" },
];

const AmbientInputBar = ({ onSubmit, isLoading = false, minimal = false }: AmbientInputBarProps) => {
  const [value, setValue] = useState("");
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
    setShowActions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "/" && value === "") {
      e.preventDefault();
      setShowActions((prev) => !prev);
    }
    if (e.key === "Escape") setShowActions(false);
  };

  useEffect(() => {
    if (value.startsWith("/")) {
      setShowActions(true);
    } else if (value.length > 0) {
      setShowActions(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      {/* Ambient glow */}
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-full"
          style={{
            background: isLoading
              ? "radial-gradient(ellipse 60% 100% at 50% 100%, hsl(var(--primary) / 0.15), transparent)"
              : "radial-gradient(ellipse 60% 100% at 50% 100%, hsl(var(--primary) / 0.06), transparent)",
          }}
          animate={{
            opacity: isLoading ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: isLoading ? 1.5 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 pb-4">
        {/* Quick actions popover */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              ref={actionsRef}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-full mb-2 left-4 right-4 glass rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden"
            >
              <p className="px-4 py-2 text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-widest border-b border-border">
                Quick Actions
              </p>
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    onSubmit(action.label);
                    setShowActions(false);
                    setValue("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60 transition-colors group"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm font-sans text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.category}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <motion.div
          layout
          className="glass rounded-2xl shadow-[var(--shadow-elevated)] border border-border/50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0"
              animate={isLoading ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className={`w-4 h-4 text-foreground ${isLoading ? "animate-pulse" : ""}`} />
            </motion.div>

            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Thinking..." : "What are you looking to build?"}
              className="flex-1 bg-transparent text-sm font-sans outline-none text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />

            <VoiceToggle onTranscript={(t) => onSubmit(t)} disabled={isLoading} />

            <button
              onClick={() => setShowActions((prev) => !prev)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
              aria-label="Quick actions"
            >
              <Slash className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
              className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {!minimal && (
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
              <kbd className="ml-auto text-[10px] text-muted-foreground/40 font-mono">/</kbd>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AmbientInputBar;
