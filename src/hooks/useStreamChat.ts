import { useCallback } from "react";
import { parseModuleDeployments, parseSuggestions, type ModuleDeployment } from "@/components/genui/parseModules";

export interface StreamCallbacks {
  onText: (snapshot: string) => void;
  onModules: (modules: ModuleDeployment[]) => void;
  onSuggestions: (suggestions: string[]) => void;
  onFieldUpdate: (key: string, value: string) => void;
  onActiveService: (serviceId: string) => void;
}

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

export { parseFieldUpdates };

export async function streamChat(
  messages: Array<{ role: string; content: string }>,
  sessionId: string,
  wizardContext: any,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, sessionId, wizardContext }),
    signal,
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
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          assistantSoFar += content;

          const { clean: afterFields, updates } = parseFieldUpdates(assistantSoFar);
          Object.entries(updates).forEach(([k, v]) => callbacks.onFieldUpdate(k, v));

          const { clean: afterModules, modules } = parseModuleDeployments(afterFields);
          modules.forEach((m) => {
            const existingIdx = streamModules.findIndex((d) => d.type === m.type);
            if (existingIdx !== -1) streamModules[existingIdx] = m;
            else streamModules.push(m);
          });

          if (modules.length > 0 && modules[0].data?.serviceId) {
            callbacks.onActiveService(modules[0].data.serviceId);
          }

          const { clean, suggestions } = parseSuggestions(afterModules);
          if (suggestions.length > 0) {
            callbacks.onSuggestions(suggestions);
          }

          callbacks.onModules([...streamModules]);
          callbacks.onText(clean);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }
}
