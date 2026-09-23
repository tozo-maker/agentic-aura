import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Slash, ShoppingCart, Cog, Server, Headphones } from "lucide-react";
import VoiceToggle from "@/components/VoiceToggle";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

interface AmbientInputBarProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
  onStop?: () => void;
}

const quickActions = [
  { icon: Headphones, label: "Cut support costs by 50%", category: "AI Support" },
  { icon: Cog, label: "Automate procurement workflows", category: "Automation" },
  { icon: ShoppingCart, label: "Build a headless storefront", category: "Commerce" },
  { icon: Server, label: "Self-healing infrastructure", category: "Infrastructure" },
];

const AmbientInputBar = ({ onSubmit, isLoading = false, minimal = false, onStop }: AmbientInputBarProps) => {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState("");
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

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
    <div className={`${minimal ? "relative" : "fixed"} bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]`}>
      {!minimal && <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-full"
          style={{
            background: isLoading
              ? "linear-gradient(to top, hsl(var(--secondary)), transparent)"
              : "linear-gradient(to top, hsl(var(--background)), transparent)",
          }}
          animate={
            reduceMotion ? { opacity: 0.5 } : { opacity: isLoading ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4] }
          }
          transition={{
            duration: isLoading ? 1.5 : 4,
            repeat: reduceMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
      </div>}

      <div className={`relative ${minimal ? "w-full" : "max-w-3xl mx-auto px-4 pb-5"}`}>
        {/* Quick actions popover */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              ref={actionsRef}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-full mb-2 left-0 right-0 glass rounded-md shadow-[var(--shadow-elevated)] overflow-hidden"
            >
              <p className="px-4 py-2 text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-widest border-b border-border">
                Quick Actions
              </p>
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  onClick={() => {
                    onSubmit(action.label);
                    setShowActions(false);
                    setValue("");
                  }}
                  variant="ghost"
                  className="w-full h-auto justify-start rounded-none px-4 py-3 text-left group"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm font-sans text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.category}</p>
                  </div>
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className={minimal ? "" : "shadow-[var(--shadow-elevated)]"}
        >
          <PromptInput
            onSubmit={(message) => {
              const text = message.text?.trim();
              if (!text || isLoading) return;
              onSubmit(text);
              setValue("");
              setShowActions(false);
            }}
            className={`${minimal ? "rounded-none border-0 border-t" : "glass rounded-md border-border"} bg-background/95`}
          >
            <PromptInputTextarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={isLoading ? "Nexus is thinking…" : "What are you looking to build?"}
              aria-label="Message the Nexus AI consultant"
              disabled={isLoading}
              className="min-h-16 px-4 pt-4 text-base"
            />
            <PromptInputFooter className="px-3 pb-3">
              <PromptInputTools>
                <VoiceToggle onTranscript={(text) => onSubmit(text)} disabled={isLoading} />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setShowActions((prev) => !prev)} aria-label="Quick actions">
                  <Slash className="w-3.5 h-3.5" />
                </Button>
                {!minimal && <span className="hidden sm:inline text-xs text-muted-foreground">Ask about a project, process, or bottleneck</span>}
              </PromptInputTools>
              <PromptInputSubmit
                status={isLoading ? "streaming" : "ready"}
                onStop={onStop}
                disabled={!value.trim() && !isLoading}
                className="bg-primary text-primary-foreground"
              />
            </PromptInputFooter>
          </PromptInput>

          {!minimal && (
            <>
              <div className="flex items-center gap-2 mt-2 px-1">
                <span className="text-[10px] font-sans text-muted-foreground/60 tracking-wide uppercase">Try:</span>
                {["AI Support", "E-Commerce", "Automation"].map((s) => (
                  <Button
                    key={s}
                    onClick={() => onSubmit(s)}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                  >
                    {s}
                  </Button>
                ))}
                <kbd className="ml-auto text-[10px] text-muted-foreground/40 font-mono">/</kbd>
              </div>

              {/* Privacy consent notice */}
              <p className="text-[9px] font-sans text-muted-foreground/40 text-center mt-2 px-1">
                By chatting, you agree to our{" "}
                <a href="/privacy" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</a>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AmbientInputBar;
