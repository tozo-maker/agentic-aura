import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InlineModuleCard from "@/components/genui/InlineModuleCard";
import WizardCard from "@/components/wizard/WizardCard";
import type { Msg } from "@/hooks/useAIChat";
import type { ModuleDeployment } from "@/components/genui/parseModules";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AlertCircle } from "lucide-react";

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
  error?: Error | null;
}

const AgentMark = ({ pulse = false }: { pulse?: boolean }) => (
  <motion.div
    className="w-7 h-7 rounded-full border border-border bg-card flex items-center justify-center shrink-0 mt-1 shadow-sm"
    animate={pulse ? { scale: [1, 1.12, 1] } : { scale: [1, 1.04, 1] }}
    transition={{ duration: pulse ? 1.4 : 3, repeat: Infinity, ease: "easeInOut" }}
  >
    <span className="font-serif text-[11px] leading-none text-foreground/70">N</span>
  </motion.div>
);

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
  error,
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

            return (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Message from={msg.role === "user" ? "user" : "assistant"} className="gap-2">
                  {msg.role === "assistant" && <AgentMark />}
                  {msg.role === "assistant" ? (
                    <MessageContent className="px-0 py-0 text-sm font-sans leading-relaxed text-foreground">

                      <MessageResponse>{msg.content}</MessageResponse>
                    </MessageContent>
                  ) : (
                    <MessageContent className="group-[.is-user]:bg-foreground group-[.is-user]:text-primary-foreground group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-sm text-sm font-sans leading-relaxed">
                      {msg.content}
                    </MessageContent>
                  )}
                </Message>
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
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="w-full max-w-[85%]">
              <WizardCard onStepSubmit={onWizardStepSubmit} onComplete={onWizardComplete} />
            </div>
          </motion.div>
        )}

        {/* Thinking indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
            <AgentMark pulse />
            <Shimmer className="text-sm font-sans mt-1.5">Thinking…</Shimmer>
          </motion.div>
        )}

        {/* Error surface */}
        {error && !isLoading && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm font-sans text-foreground">
              <p className="font-medium">Something interrupted the response.</p>
              <p className="text-muted-foreground">{error.message || "Please try sending your message again."}</p>
            </div>
          </div>
        )}

        {/* Suggestion chips */}
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

        <div ref={bottomRef} className="h-24" />
      </div>
    </section>
  );
};

export default ConversationThread;
