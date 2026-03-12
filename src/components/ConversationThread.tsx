import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import InlineModuleCard from "@/components/genui/InlineModuleCard";
import WizardCard from "@/components/wizard/WizardCard";
import type { Msg } from "@/hooks/useAIChat";
import type { ModuleDeployment } from "@/components/genui/parseModules";
import { Sparkles } from "lucide-react";

interface ConversationThreadProps {
  messages: Msg[];
  isLoading: boolean;
  deployedModules: ModuleDeployment[];
  onRemoveModule: (index: number) => void;
  onSendMessage: (text: string) => void;
  wizard: { schema: any; completed: boolean };
  onWizardStepSubmit: (data: Record<string, string>) => void;
  onWizardComplete: () => void;
  suggestions: string[];
}

const ConversationThread = ({
  messages,
  isLoading,
  deployedModules,
  onRemoveModule,
  onSendMessage,
  wizard,
  onWizardStepSubmit,
  onWizardComplete,
  suggestions,
}: ConversationThreadProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const visibleMessages = messages.filter((m) => !m.hidden || m.role === "module");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, deployedModules]);

  return (
    <section className="relative py-8 px-4 noise-overlay">
      <div className="max-w-2xl mx-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((msg, i) => {
            // Inline module message
            if (msg.role === "module" && msg.module) {
              const deployedIdx = deployedModules.findIndex((d) => d.type === msg.module!.type);
              if (deployedIdx === -1) return null;
              const mod = deployedModules[deployedIdx];

              return (
                <motion.div
                  key={`mod-inline-${i}`}
                  initial={{ opacity: 0, y: 20, filter: "blur(12px)", scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="my-4"
                >
                  <InlineModuleCard
                    mod={mod}
                    onRemove={() => onRemoveModule(deployedIdx)}
                    onSendMessage={onSendMessage}
                  />
                </motion.div>
              );
            }

            // Text message
            return (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
              >
                {/* AI Avatar */}
                {msg.role === "assistant" && (
                  <motion.div
                    className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-1"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
                  </motion.div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-sans leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground [&_p]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* User indicator */}
                {msg.role === "user" && (
                  <span className="text-[10px] font-sans text-muted-foreground/50 self-end mb-1 shrink-0">You</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pre-loaded modules not tied to messages */}
        {deployedModules
          .filter((mod) => !visibleMessages.some((m) => m.module?.type === mod.type))
          .map((mod, i) => (
            <motion.div
              key={`preload-${mod.type}`}
              initial={{ opacity: 0, y: 20, filter: "blur(12px)", scale: 0.96 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: i * 0.1 }}
              className="my-4"
            >
              <InlineModuleCard
                mod={mod}
                onRemove={() => {
                  const idx = deployedModules.indexOf(mod);
                  if (idx !== -1) onRemoveModule(idx);
                }}
                onSendMessage={onSendMessage}
                showChat={false}
              />
            </motion.div>
          ))}

        {/* Wizard */}
        {wizard.schema && !wizard.completed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-full max-w-[85%]">
              <WizardCard onStepSubmit={onWizardStepSubmit} onComplete={onWizardComplete} />
            </div>
          </motion.div>
        )}

        {/* Shimmer thinking indicator */}
        {isLoading && visibleMessages[visibleMessages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2"
          >
            <motion.div
              className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
            </motion.div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm overflow-hidden flex-1 max-w-[80%]">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted"
                animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 100%" }}
              />
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted mt-2 w-2/3"
                animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.2 }}
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>
          </motion.div>
        )}

        {/* Suggestion chips with staggered animation */}
        {suggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSendMessage(s)}
                className="px-3 py-1.5 text-xs font-sans rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {/* Spacer for sticky input bar */}
        <div ref={bottomRef} className="h-24" />
      </div>
    </section>
  );
};

export default ConversationThread;
