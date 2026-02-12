import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Sparkles, ShoppingCart, Cog, Server } from "lucide-react";

interface OmniBarProps {
  open: boolean;
  onClose: () => void;
  onOpenChat: (intent?: string, wizardId?: string) => void;
  onScrollToServices: () => void;
}

const intents = [
  { icon: Sparkles, label: "Cut support costs by 50%", category: "AI Support", wizardId: "support_assessment" },
  { icon: Cog, label: "Automate procurement workflows", category: "Automation", wizardId: "automation_scoping" },
  { icon: ShoppingCart, label: "Build a headless storefront", category: "Commerce", wizardId: "commerce_wizard" },
  { icon: Server, label: "Self-healing infrastructure setup", category: "Infrastructure", wizardId: "infrastructure_wizard" },
];

const OmniBar = ({ open, onClose, onOpenChat, onScrollToServices }: OmniBarProps) => {
  const [query, setQuery] = useState("");

  const filtered = intents.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (label: string, wizardId: string) => {
      onClose();
      onOpenChat(label, wizardId);
    },
    [onClose, onOpenChat]
  );

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-[20%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="glass rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden mx-4">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you need to build?"
                  className="flex-1 bg-transparent text-base font-sans text-foreground placeholder:text-muted-foreground outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filtered.length > 0) {
                      handleSelect(filtered[0].label, filtered[0].wizardId);
                    }
                  }}
                />
                <kbd className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">ESC</kbd>
              </div>

              <div className="p-2 max-h-64 overflow-y-auto">
                <p className="px-3 py-2 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </p>
                {filtered.map((intent) => (
                  <button
                    key={intent.label}
                    onClick={() => handleSelect(intent.label, intent.wizardId)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-secondary/60 transition-colors group"
                  >
                    <intent.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <div className="flex-1">
                      <p className="text-sm font-sans text-foreground">{intent.label}</p>
                      <p className="text-xs text-muted-foreground">{intent.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                {filtered.length === 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChat(query);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-secondary/60 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-sans text-foreground">
                      Ask our AI: "<span className="italic">{query}</span>"
                    </p>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OmniBar;
