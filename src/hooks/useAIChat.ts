import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useWizard } from "@/components/wizard/WizardProvider";
import { type ModuleDeployment } from "@/components/genui/parseModules";
import { getStoredSession, storeSession, isSessionExpired, trackAnalytics } from "./useSession";

export type Msg = {
  role: "user" | "assistant" | "module";
  content: string;
  hidden?: boolean;
  module?: ModuleDeployment;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const MODULE_TOOLS = [
  "service_spotlight",
  "comparison_table",
  "roi_calculator",
  "case_study",
  "timeline",
  "pricing_tier",
  "process_flow",
] as const;

const GREETING = "Hi! I'm the Nexus AI consultant. I can help you scope your project, understand our services, or get a quick estimate. What are you looking to build?";

const INITIAL_MESSAGES: UIMessage[] = [
  { id: "greeting", role: "assistant", parts: [{ type: "text", text: GREETING }] },
];

type AnyPart = { type: string; text?: string; input?: unknown; state?: string };

const toolNameOf = (part: AnyPart) => (part.type.startsWith("tool-") ? part.type.slice(5) : null);

export function useAIChat(onActiveService?: (service: string | null) => void) {
  const stored = getStoredSession();
  const expired = isSessionExpired(stored);

  const [sessionId] = useState(() => {
    if (stored && !expired) return stored.sessionId;
    const id = crypto.randomUUID();
    storeSession(id);
    return id;
  });

  const [input, setInput] = useState("");
  const [removedModules, setRemovedModules] = useState<string[]>([]);
  const [preloaded, setPreloaded] = useState<ModuleDeployment[]>([]);
  const [expiredNotice, setExpiredNotice] = useState<string[]>([]);
  const hasStartedWizard = useRef(false);
  const wizard = useWizard();

  // Keep the freshest wizard context available to the transport without recreating it.
  const wizardContextRef = useRef<unknown>(undefined);
  wizardContextRef.current = wizard.schema
    ? {
        wizardId: wizard.schema.id,
        currentStep: wizard.schema.steps[wizard.stepIndex],
        stepIndex: wizard.stepIndex,
        totalSteps: wizard.schema.steps.length,
        collectedData: wizard.data,
        allFields: wizard.schema.steps.flatMap((s: { fields: { id: string }[] }) => s.fields.map((f) => f.id)),
      }
    : undefined;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: CHAT_URL,
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, sessionId, wizardContext: wizardContextRef.current },
        }),
      }),
    [sessionId],
  );

  const { messages: uiMessages, sendMessage: sdkSend, setMessages, status, error } = useChat({
    id: sessionId,
    messages: INITIAL_MESSAGES,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // ---- Load previous conversation -------------------------------------------------
  const historyLoaded = useRef(false);
  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;

    if (!stored || expired) {
      if (stored && expired) setExpiredNotice(["Continue previous conversation", "Start fresh"]);
      return;
    }

    fetch(`${CHAT_URL}?history=true&sessionId=${encodeURIComponent(stored.sessionId)}`, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    })
      .then((r) => r.json())
      .then(({ messages: history }: { messages?: Array<{ role: string; content: string }> }) => {
        if (!history?.length) return;
        const restored: UIMessage[] = history.map((row, i) => {
          if (row.role === "assistant") {
            let parts: AnyPart[];
            try {
              const parsed = JSON.parse(row.content);
              parts = Array.isArray(parsed) ? parsed : [{ type: "text", text: row.content }];
            } catch {
              parts = [{ type: "text", text: row.content }];
            }
            return { id: `hist-${i}`, role: "assistant", parts } as UIMessage;
          }
          return {
            id: `hist-${i}`,
            role: "user",
            parts: [{ type: "text", text: row.content }],
          } as UIMessage;
        });
        setMessages(restored);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Derive view models from AI SDK messages ------------------------------------
  const { messages, deployedModules, suggestions } = useMemo(() => {
    const msgs: Msg[] = [];
    const modulesByType = new Map<string, ModuleDeployment>();
    const order: string[] = [];
    let latestSuggestions: string[] = [];

    for (const m of uiMessages) {
      const parts = (m.parts ?? []) as AnyPart[];
      const text = parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("");

      if (m.role === "user") {
        if (text.trim()) msgs.push({ role: "user", content: text });
        continue;
      }

      if (text.trim()) msgs.push({ role: "assistant", content: text });

      for (const part of parts) {
        const name = toolNameOf(part);
        if (!name || part.input == null) continue;

        if (name === "suggest_replies") {
          const s = (part.input as { suggestions?: string[] }).suggestions;
          if (Array.isArray(s)) latestSuggestions = s;
        } else if ((MODULE_TOOLS as readonly string[]).includes(name)) {
          const mod: ModuleDeployment = { type: name, data: part.input as Record<string, unknown> };
          modulesByType.set(name, mod);
          if (!order.includes(name)) order.push(name);
          msgs.push({ role: "module", content: "", hidden: true, module: mod });
        }
      }
    }

    const live = order
      .filter((t) => !removedModules.includes(t))
      .map((t) => modulesByType.get(t)!)
      .reverse();

    const extras = preloaded.filter((p) => !modulesByType.has(p.type) && !removedModules.includes(p.type));

    return {
      messages: msgs.filter((m) => m.role !== "module" || !removedModules.includes(m.module!.type)),
      deployedModules: [...extras, ...live],
      suggestions: isLoading ? [] : latestSuggestions.length ? latestSuggestions : expiredNotice,
    };
  }, [uiMessages, removedModules, preloaded, expiredNotice, isLoading]);

  // ---- Wizard field sync from tool calls -------------------------------------------
  const appliedFields = useRef(new Set<string>());
  useEffect(() => {
    for (const m of uiMessages) {
      for (const part of (m.parts ?? []) as AnyPart[]) {
        if (toolNameOf(part) !== "update_wizard_fields" || !part.input) continue;
        const fields = (part.input as { fields?: Array<{ id: string; value: string }> }).fields ?? [];
        for (const f of fields) {
          const key = `${m.id}:${f.id}:${f.value}`;
          if (appliedFields.current.has(key)) continue;
          appliedFields.current.add(key);
          wizard.updateField(f.id, f.value);
        }
      }
    }
  }, [uiMessages, wizard]);

  // ---- Active service highlight -----------------------------------------------------
  const activeServiceRef = useRef(onActiveService);
  activeServiceRef.current = onActiveService;
  useEffect(() => {
    const spotlight = [...uiMessages]
      .reverse()
      .flatMap((m) => (m.parts ?? []) as AnyPart[])
      .find((p) => toolNameOf(p) === "service_spotlight");
    const serviceId = (spotlight?.input as { serviceId?: string } | undefined)?.serviceId ?? null;
    activeServiceRef.current?.(serviceId);
  }, [uiMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setExpiredNotice([]);
      storeSession(sessionId);
      setInput("");
      await sdkSend({ text: text.trim() });
    },
    [isLoading, sdkSend, sessionId],
  );

  const send = () => sendMessage(input);

  const handleWizardStepSubmit = (stepData: Record<string, string>) => {
    const summary = Object.entries(stepData).map(([k, v]) => `${k}: ${v}`).join(", ");
    if (summary) sendMessage(`Here are my details — ${summary}`);
  };

  const handleWizardComplete = async () => {
    await wizard.completeWizard(sessionId);
    sendMessage("That's everything. Please summarise what you've captured and suggest next steps.");
  };

  const removeDeployedModule = (index: number) => {
    const mod = deployedModules[index];
    if (mod) setRemovedModules((prev) => [...prev, mod.type]);
  };

  const preloadModule = useCallback(
    (type: string, data: Record<string, any>) => {
      setRemovedModules((prev) => prev.filter((t) => t !== type));
      setPreloaded((prev) => [{ type, data }, ...prev.filter((m) => m.type !== type)]);
      trackAnalytics(sessionId, "module_preloaded", type);
    },
    [sessionId],
  );

  return {
    sessionId,
    messages,
    input,
    setInput,
    isLoading,
    status,
    error,
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
