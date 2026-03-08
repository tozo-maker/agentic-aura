import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useWizard } from "./wizard/WizardProvider";
import WizardCard from "./wizard/WizardCard";
import VoiceToggle from "./VoiceToggle";
import GenUIRenderer from "./genui/GenUIRenderer";
import { parseModuleDeployments, parseSuggestions, type ModuleDeployment } from "./genui/parseModules";

type Msg = {
  role: "user" | "assistant" | "module";
  content: string;
  hidden?: boolean;
  module?: ModuleDeployment;
};

interface AIChatProps {
  open: boolean;
  onToggle: () => void;
  initialIntent?: string | null;
  wizardId?: string | null;
  onActiveService?: (service: string | null) => void;
}

/** Parse [FIELD_UPDATE:key=value] markers from streamed text */
function parseFieldUpdates(text: string): { clean: string; updates: Record<string, string> } {
  const updates: Record<string, string> = {};
  let clean = text.replace(/\[FIELD_UPDATE:(\w+)=([^\]]+)\]/g, (_, k, v) => {
    updates[k] = v;
    return "";
  });

  // Strip any incomplete marker still being streamed
  const incompleteIdx = clean.lastIndexOf("[FIELD_UPDATE:");
  if (incompleteIdx !== -1) {
    const afterMarker = clean.slice(incompleteIdx);
    if (!afterMarker.match(/\[FIELD_UPDATE:\w+=([^\]]+)\]/)) {
      clean = clean.slice(0, incompleteIdx);
    }
  }

  return { clean: clean.trim(), updates };
}

const AIChat = ({ open, onToggle, initialIntent, wizardId, onActiveService }: AIChatProps) => {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the Nexus AI consultant. I can help you scope your project, understand our services, or get a quick estimate. What are you looking to build?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStartedWizard = useRef(false);

  const wizard = useWizard();

  useEffect(() => {
    if (wizardId && !hasStartedWizard.current) {
      hasStartedWizard.current = true;
      wizard.startWizard(wizardId);
      if (initialIntent) {
        sendMessage(`I'd like help with: ${initialIntent}`, true);
      }
    }
  }, [wizardId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, wizard.stepIndex, wizard.data]);

  const sendMessage = useCallback(async (text: string, hidden = false) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim(), hidden };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const wizardContext = wizard.schema
      ? {
          wizardId: wizard.schema.id,
          currentStep: wizard.schema.steps[wizard.stepIndex],
          stepIndex: wizard.stepIndex,
          totalSteps: wizard.schema.steps.length,
          collectedData: wizard.data,
          allFields: wizard.schema.steps.flatMap((s) => s.fields.map((f) => f.id)),
        }
      : undefined;

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const allMessages = [...messages, userMsg].filter((m) => !m.hidden || m === userMsg).map(({ role, content }) => ({ role: role === "module" ? "assistant" : role, content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, sessionId, wizardContext }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;
      const deployedModules: ModuleDeployment[] = [];

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;

              // Parse field updates
              const { clean: afterFields, updates } = parseFieldUpdates(assistantSoFar);
              Object.entries(updates).forEach(([k, v]) => wizard.updateField(k, v));

              // Parse module deployments
              const { clean, modules } = parseModuleDeployments(afterFields);
              modules.forEach((m) => {
                if (!deployedModules.find((d) => d.type === m.type && JSON.stringify(d.data) === JSON.stringify(m.data))) {
                  deployedModules.push(m);
                }
              });

              // Emit active service signal for page-level reactivity
              const serviceMap: Record<string, string> = {
                service_spotlight: clean.toLowerCase(),
              };
              if (modules.length > 0 && modules[0].data?.serviceId) {
                onActiveService?.(modules[0].data.serviceId);
              }

              const snapshot = clean;
              setMessages((prev) => {
                // Remove old module messages from this stream
                const withoutStreamModules = prev.filter((m) => !(m.role === "module" && m.hidden));
                
                const last = withoutStreamModules[withoutStreamModules.length - 1];
                let updated: Msg[];
                if (last?.role === "assistant" && withoutStreamModules.length > 1) {
                  updated = withoutStreamModules.map((m, i) =>
                    i === withoutStreamModules.length - 1 ? { ...m, content: snapshot } : m
                  );
                } else {
                  updated = [...withoutStreamModules, { role: "assistant", content: snapshot }];
                }

                // Append module messages
                const moduleMessages: Msg[] = deployedModules.map((mod) => ({
                  role: "module" as const,
                  content: "",
                  hidden: true, // hidden from text but rendered as module
                  module: mod,
                }));

                return [...updated, ...moduleMessages];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again or schedule a human call below." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, sessionId, wizard, onActiveService]);

  const send = () => sendMessage(input);

  const handleModuleAction = (msg: string) => sendMessage(msg);

  const handleWizardStepSubmit = (stepData: Record<string, string>) => {
    const summary = Object.entries(stepData).map(([k, v]) => `${k}: ${v}`).join(", ");
    if (summary) sendMessage(`[WIZARD_UPDATE] ${summary}`, true);
  };

  const handleWizardComplete = async () => {
    await wizard.completeWizard(sessionId);
    sendMessage("[WIZARD_COMPLETE] All information has been collected. Please provide a summary of what was gathered and suggest next steps.", true);
  };

  const handleVoiceTranscript = (text: string) => sendMessage(text);

  const visibleMessages = messages.filter((m) => !m.hidden || m.role === "module");

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-foreground text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label="Open AI Consultant"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] sm:max-w-[calc(100vw-3rem)] h-[100dvh] sm:h-[560px] sm:max-h-[calc(100vh-3rem)] glass sm:rounded-2xl shadow-[var(--shadow-elevated)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-sm font-sans font-semibold text-foreground">Nexus AI Consultant</h3>
                <p className="text-xs text-muted-foreground">Hybrid Intelligence</p>
              </div>
              <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages + Wizard + GenUI Modules */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {visibleMessages.map((msg, i) => {
                // Render GenUI module
                if (msg.role === "module" && msg.module) {
                  return (
                    <div key={`mod-${i}`} className="w-full">
                      <GenUIRenderer deployment={msg.module} onAction={handleModuleAction} />
                    </div>
                  );
                }

                return (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-sans leading-relaxed ${
                        msg.role === "user"
                          ? "bg-foreground text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                );
              })}

              {wizard.schema && !wizard.completed && (
                <WizardCard onStepSubmit={handleWizardStepSubmit} onComplete={handleWizardComplete} />
              )}

              {isLoading && visibleMessages[visibleMessages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Fallback CTA */}
            <div className="px-4 pb-2">
              <button className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                <Phone className="w-3 h-3" />
                Prefer a human? Schedule a call
              </button>
            </div>

            {/* Input + Voice */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                <VoiceToggle onTranscript={handleVoiceTranscript} disabled={isLoading} />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Describe your project..."
                  className="flex-1 bg-transparent text-sm font-sans outline-none text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={send} disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
