import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import GenUIRenderer from "@/components/genui/GenUIRenderer";
import WizardCard from "@/components/wizard/WizardCard";
import type { Msg } from "@/hooks/useAIChat";
import type { ModuleDeployment } from "@/components/genui/parseModules";
import { X, MessageCircle } from "lucide-react";

const moduleLabels: Record<string, string> = {
  service_spotlight: "Service Spotlight",
  comparison_table: "Comparison",
  roi_calculator: "ROI Calculator",
  case_study: "Case Study",
  timeline: "Timeline",
  pricing_tier: "Pricing",
  process_flow: "Process",
};

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
        {/* Messages */}
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((msg, i) => {
            if (msg.role === "module" && msg.module) {
              return (
                <motion.div
                  key={`mod-inline-${i}`}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="my-4"
                >
                  {/* Find corresponding deployed module to render */}
                  {(() => {
                    const deployedIdx = deployedModules.findIndex((d) => d.type === msg.module!.type);
                    if (deployedIdx === -1) return null;
                    const mod = deployedModules[deployedIdx];
                    return (
                      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                              {moduleLabels[mod.type] || mod.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onSendMessage(`Tell me more about this ${moduleLabels[mod.type] || mod.type}`)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRemoveModule(deployedIdx)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-5">
                          <GenUIRenderer deployment={mod} onAction={(msg) => onSendMessage(msg)} />
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-sans leading-relaxed ${
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
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Deployed modules not tied to messages (pre-loaded) */}
        {deployedModules
          .filter((mod) => !visibleMessages.some((m) => m.module?.type === mod.type))
          .map((mod, i) => (
            <motion.div
              key={`preload-${mod.type}`}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: i * 0.1 }}
              className="my-4"
            >
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      {moduleLabels[mod.type] || mod.type}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const idx = deployedModules.indexOf(mod);
                      if (idx !== -1) onRemoveModule(idx);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-5">
                  <GenUIRenderer deployment={mod} onAction={(msg) => onSendMessage(msg)} />
                </div>
              </div>
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

        {/* Loading indicator */}
        {isLoading && visibleMessages[visibleMessages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        {/* Suggestion chips */}
        {suggestions.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSendMessage(s)}
                className="px-3 py-1.5 text-xs font-sans rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        {/* Spacer for sticky input bar */}
        <div ref={bottomRef} className="h-24" />
      </div>
    </section>
  );
};

export default ConversationThread;
