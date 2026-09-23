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
import { AlertCircle, X, RotateCcw, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onOpenHistory?: () => void;
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
  onOpenHistory,
}: ConversationThreadProps) => {
  const visibleMessages = messages.filter((m) => !m.hidden || m.role === "module");

  return (
    <section className="relative min-h-0 flex-1 flex flex-col" aria-label="Conversation with Nexus AI consultant">
      <div className="min-h-0 flex-1 flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-background/90 backdrop-blur-xl">
          {onOpenHistory && <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onOpenHistory} aria-label="Open conversation history"><PanelLeft /></Button>}
          <AgentMark pulse={isLoading} />
          <div className="min-w-0">
            <p className="text-sm font-sans font-medium text-foreground leading-tight">Nexus AI Consultant</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {isLoading ? "Responding…" : "Online"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {onReset && (
              <Button
                onClick={onReset}
                aria-label="Start a new conversation"
                title="New conversation"
                variant="ghost" size="icon-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                aria-label="Close conversation and return to site"
                title="Back to site"
                variant="ghost" size="icon-sm"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable transcript */}
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="gap-6 px-4 sm:px-8 py-8 pb-10 max-w-3xl mx-auto w-full">
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
                        <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:rounded-md text-sm font-sans leading-relaxed">
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
          <div className="flex flex-wrap gap-2 px-4 sm:px-8 py-3 border-t border-border bg-secondary/35">
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
