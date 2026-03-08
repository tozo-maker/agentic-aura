import { useState, useRef, useCallback } from "react";
import { useWizard } from "@/components/wizard/WizardProvider";
import { parseModuleDeployments, parseSuggestions, type ModuleDeployment } from "@/components/genui/parseModules";

export type Msg = {
  role: "user" | "assistant" | "module";
  content: string;
  hidden?: boolean;
  module?: ModuleDeployment;
};

function parseFieldUpdates(text: string): { clean: string; updates: Record<string, string> } {
  const updates: Record<string, string> = {};
  let clean = text.replace(/\[FIELD_UPDATE:(\w+)=([^\]]+)\]/g, (_, k, v) => {
    updates[k] = v;
    return "";
  });
  const incompleteIdx = clean.lastIndexOf("[FIELD_UPDATE:");
  if (incompleteIdx !== -1) {
    const afterMarker = clean.slice(incompleteIdx);
    if (!afterMarker.match(/\[FIELD_UPDATE:\w+=([^\]]+)\]/)) {
      clean = clean.slice(0, incompleteIdx);
    }
  }
  return { clean: clean.trim(), updates };
}

export function useAIChat(onActiveService?: (service: string | null) => void) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Nexus AI consultant. I can help you scope your project, understand our services, or get a quick estimate. What are you looking to build?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deployedModules, setDeployedModules] = useState<ModuleDeployment[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const hasStartedWizard = useRef(false);
  const wizard = useWizard();

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
      const allMessages = [...messages, userMsg]
        .filter((m) => !m.hidden || m === userMsg)
        .map(({ role, content }) => ({ role: role === "module" ? "assistant" : role, content }));

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
      const streamModules: ModuleDeployment[] = [];

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

              const { clean: afterFields, updates } = parseFieldUpdates(assistantSoFar);
              Object.entries(updates).forEach(([k, v]) => wizard.updateField(k, v));

              const { clean, modules } = parseModuleDeployments(afterFields);
              modules.forEach((m) => {
                const existingIdx = streamModules.findIndex((d) => d.type === m.type);
                if (existingIdx !== -1) streamModules[existingIdx] = m;
                else streamModules.push(m);
              });

              if (modules.length > 0 && modules[0].data?.serviceId) {
                onActiveService?.(modules[0].data.serviceId);
              }

              // Update deployed modules for canvas (replace by type)
              setDeployedModules((prev) => {
                const updated = [...prev];
                streamModules.forEach((sm) => {
                  const idx = updated.findIndex((p) => p.type === sm.type);
                  if (idx !== -1) updated[idx] = sm;
                  else updated.push(sm);
                });
                return updated;
              });

              const snapshot = clean;
              setMessages((prev) => {
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
                const moduleMessages: Msg[] = streamModules.map((mod) => ({
                  role: "module" as const,
                  content: "",
                  hidden: true,
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
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, sessionId, wizard, onActiveService]);

  const send = () => sendMessage(input);

  const handleWizardStepSubmit = (stepData: Record<string, string>) => {
    const summary = Object.entries(stepData).map(([k, v]) => `${k}: ${v}`).join(", ");
    if (summary) sendMessage(`[WIZARD_UPDATE] ${summary}`, true);
  };

  const handleWizardComplete = async () => {
    await wizard.completeWizard(sessionId);
    sendMessage("[WIZARD_COMPLETE] All information has been collected. Please provide a summary.", true);
  };

  const removeDeployedModule = (index: number) => {
    setDeployedModules((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    sessionId,
    messages,
    input,
    setInput,
    isLoading,
    deployedModules,
    sendMessage,
    send,
    wizard,
    hasStartedWizard,
    handleWizardStepSubmit,
    handleWizardComplete,
    removeDeployedModule,
  };
}
