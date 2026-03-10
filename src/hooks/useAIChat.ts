import { useState, useRef, useCallback, useEffect } from "react";
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

const SESSION_KEY = "nexus_chat_sessionId";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getStoredSession(): { sessionId: string; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function storeSession(sessionId: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, timestamp: Date.now() }));
}

function trackAnalytics(sessionId: string, eventType: string, moduleType?: string, metadata?: Record<string, any>) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat?analytics=true`;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ sessionId, eventType, moduleType, metadata }),
  }).catch(() => {});
}

const INITIAL_MSG: Msg = {
  role: "assistant",
  content: "Hi! I'm the Nexus AI consultant. I can help you scope your project, understand our services, or get a quick estimate. What are you looking to build?",
};

export function useAIChat(onActiveService?: (service: string | null) => void) {
  const stored = getStoredSession();
  const isExpired = stored ? (Date.now() - stored.timestamp > SESSION_EXPIRY_MS) : true;

  const [sessionId] = useState(() => {
    if (stored && !isExpired) return stored.sessionId;
    const id = crypto.randomUUID();
    storeSession(id);
    return id;
  });

  const [messages, setMessages] = useState<Msg[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deployedModules, setDeployedModules] = useState<ModuleDeployment[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const hasStartedWizard = useRef(false);
  const wizard = useWizard();

  // Load conversation history on mount
  useEffect(() => {
    if (historyLoaded) return;
    setHistoryLoaded(true);

    if (!stored || isExpired) {
      if (stored && isExpired) {
        // Expired session — offer to continue as a suggestion
        setSuggestions(["Continue previous conversation", "Start fresh"]);
      }
      return;
    }

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat?history=true&sessionId=${encodeURIComponent(stored.sessionId)}`;
    fetch(CHAT_URL, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    })
      .then((r) => r.json())
      .then(({ messages: history }) => {
        if (!history || history.length === 0) return;

        const restored: Msg[] = [];
        const restoredModules: ModuleDeployment[] = [];

        for (const msg of history) {
          if (msg.role === "assistant") {
            // Re-parse modules from stored assistant messages
            const { clean: afterFields } = parseFieldUpdates(msg.content);
            const { clean: afterModules, modules } = parseModuleDeployments(afterFields);
            const { clean, suggestions: s } = parseSuggestions(afterModules);

            modules.forEach((m) => {
              const idx = restoredModules.findIndex((d) => d.type === m.type);
              if (idx !== -1) restoredModules[idx] = m;
              else restoredModules.push(m);
            });

            restored.push({ role: "assistant", content: clean });
            modules.forEach((mod) =>
              restored.push({ role: "module", content: "", hidden: true, module: mod })
            );
            if (s.length > 0) setSuggestions(s);
          } else {
            // Skip hidden wizard messages
            if (msg.content.startsWith("[WIZARD_")) continue;
            restored.push({ role: "user", content: msg.content });
          }
        }

        if (restored.length > 0) {
          setMessages(restored);
          setDeployedModules(restoredModules);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(async (text: string, hidden = false) => {
    if (!text.trim() || isLoading) return;
    setSuggestions([]);

    // Update stored session timestamp
    storeSession(sessionId);

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

              const { clean: afterModules, modules } = parseModuleDeployments(afterFields);
              modules.forEach((m) => {
                const existingIdx = streamModules.findIndex((d) => d.type === m.type);
                if (existingIdx !== -1) streamModules[existingIdx] = m;
                else streamModules.push(m);
              });

              if (modules.length > 0 && modules[0].data?.serviceId) {
                onActiveService?.(modules[0].data.serviceId);
              }

              const { clean, suggestions: parsedSuggestions } = parseSuggestions(afterModules);
              if (parsedSuggestions.length > 0) {
                setSuggestions(parsedSuggestions);
              }

              setDeployedModules((prev) => {
                const updated = prev.filter((p) => !streamModules.some((sm) => sm.type === p.type));
                return [...streamModules, ...updated];
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

  const preloadModule = useCallback((type: string, data: Record<string, any>) => {
    setDeployedModules((prev) => {
      const filtered = prev.filter((m) => m.type !== type);
      return [{ type, data }, ...filtered];
    });
    trackAnalytics(sessionId, "module_preloaded", type);
  }, [sessionId]);

  return {
    sessionId,
    messages,
    input,
    setInput,
    isLoading,
    deployedModules,
    suggestions,
    sendMessage,
    send,
    wizard,
    hasStartedWizard,
    handleWizardStepSubmit,
    handleWizardComplete,
    removeDeployedModule,
    preloadModule,
  };
}
