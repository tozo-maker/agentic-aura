import { motion, AnimatePresence } from "framer-motion";
import InlineModuleCard from "@/components/genui/InlineModuleCard";
import WizardCard from "@/components/wizard/WizardCard";
import type { Msg } from "@/hooks/useAIChat";
import type { ModuleDeployment } from "@/components/genui/parseModules";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { AlertCircle, X, RotateCcw } from "lucide-react";

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
  onClose?: () => void;
  onReset?: () => void;
}

const AgentMark = ({ pulse = false }: { pulse?: boolean }) => (
  <motion.div
    className="w-7 h-7 rounded-full border border-border bg-card flex items-center justify-center shrink-0 mt-1 shadow-sm"
    animate={pulse ? { scale: [1, 1.12, 1] } : {}}
    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
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
  onClose,
  onReset,
}: ConversationThreadProps) => {
  const visibleMessages = messages.filter((m) => !m.hidden || m.role === "module");

  return (
    <section className="relative px-4 pt-2" aria-label="Conversation with Nexus AI consultant">
      <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card/60 shadow-[var(--shadow-glass)] overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/70 backdrop-blur-xl">
          <AgentMark pulse={isLoading} />
          <div className="min-w-0">
            <p className="text-sm font-sans font-medium text-foreground leading-tight">Nexus AI Consultant</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {isLoading ? "Responding…" : "Online"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {onReset && (
              <button
                onClick={onReset}
                aria-label="Start a new conversation"
                title="New conversation"
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close conversation and return to site"
                title="Back to site"
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable transcript */}
        <Conversation className="h-[min(60vh,32rem)]">
          <ConversationContent className="gap-4 p-4 pb-6">
            <AnimatePresence mode="popLayout">
              {visibleMessages.map((msg, i) => {
                if (msg.role === "module" && msg.module) {
                  const deployedIdx = deployedModules.findIndex((d) => d.type === msg.module!.type);
                  if (deployedIdx === -1) return null;
                  const mod = deployedModules[deployedIdx];

                  return (
                    <motion.div
                      key={`mod-inline-${i}`}
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="w-full"
                    >
                      <InlineModuleCard
                        mod={mod}
                        onRemove={() => onRemoveModule(deployedIdx)}
                        onSendMessage={onSendMessage}
                      />
                    </motion.div>
                  );
                }

                const prev = visibleMessages[i - 1];
                const groupedAssistant = msg.role === "assistant" && prev?.role === "assistant";

                return (
                  <motion.div
                    key={`msg-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Message from={msg.role === "user" ? "user" : "assistant"} className="gap-2">
                      {msg.role === "assistant" &&
                        (groupedAssistant ? <div className="w-7 shrink-0" aria-hidden="true" /> : <AgentMark />)}
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
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28, delay: i * 0.08 }}
                  className="w-full"
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
                <div className="w-full">
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
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Suggestion chips */}
        {suggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-border bg-background/60">
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSendMessage(s)}
                className="px-3 py-1.5 text-xs font-sans rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConversationThread;
