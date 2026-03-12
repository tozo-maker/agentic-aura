import { useState, useRef, useCallback, useEffect } from "react";
import { useWizard } from "@/components/wizard/WizardProvider";
import { type ModuleDeployment } from "@/components/genui/parseModules";
import { getStoredSession, storeSession, isSessionExpired, trackAnalytics } from "./useSession";
import { streamChat, parseFieldUpdates } from "./useStreamChat";
import { parseModuleDeployments, parseSuggestions } from "@/components/genui/parseModules";

export type Msg = {
  role: "user" | "assistant" | "module";
  content: string;
  hidden?: boolean;
  module?: ModuleDeployment;
};

const INITIAL_MSG: Msg = {
  role: "assistant",
  content: "Hi! I'm the Nexus AI consultant. I can help you scope your project, understand our services, or get a quick estimate. What are you looking to build?",
};

export function useAIChat(onActiveService?: (service: string | null) => void) {
  const stored = getStoredSession();
  const expired = isSessionExpired(stored);

  const [sessionId] = useState(() => {
    if (stored && !expired) return stored.sessionId;
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

    if (!stored || expired) {
      if (stored && expired) {
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
      const allMessages = [...messages, userMsg]
        .filter((m) => !m.hidden || m === userMsg)
        .map(({ role, content }) => ({ role: role === "module" ? "assistant" : role, content }));

      const streamModulesRef: ModuleDeployment[] = [];

      await streamChat(allMessages, sessionId, wizardContext, {
        onText: (snapshot) => {
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
            const moduleMessages: Msg[] = streamModulesRef.map((mod) => ({
              role: "module" as const,
              content: "",
              hidden: true,
              module: mod,
            }));
            return [...updated, ...moduleMessages];
          });
        },
        onModules: (modules) => {
          streamModulesRef.length = 0;
          streamModulesRef.push(...modules);
          setDeployedModules((prev) => {
            const updated = prev.filter((p) => !modules.some((sm) => sm.type === p.type));
            return [...modules, ...updated];
          });
        },
        onSuggestions: (s) => setSuggestions(s),
        onFieldUpdate: (k, v) => wizard.updateField(k, v),
        onActiveService: (serviceId) => onActiveService?.(serviceId),
      });
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
