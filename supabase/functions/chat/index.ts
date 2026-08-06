import { createClient } from "npm:@supabase/supabase-js@2";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "npm:ai@7";
import { genuiTools, moduleToolNames } from "../_shared/genui-tools.ts";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "../_shared/ai-gateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WizardContext {
  wizardId: string;
  currentStep: { title: string; fields: Array<{ id: string; label: string }> };
  stepIndex: number;
  totalSteps: number;
  collectedData: Record<string, string>;
  allFields: string[];
}

const BASE_SYSTEM_PROMPT = `You are the Nexus AI Consultant — a sophisticated, warm, and professional AI agent for a hybrid intelligence agency called Nexus AI.

Your role is to qualify leads by understanding their needs and extracting key information through natural conversation.

1. **Understand intent**: classify the visitor's need into one of: commerce, automation, infrastructure, ai_support, data_intelligence, generative_ui.
2. **Qualify the lead**: naturally ask about company/project, budget range, timeline and pain points. Never ask for everything at once.
3. **Be helpful**: give genuine insight into how hybrid automation (AI + human verification) solves their problem.
4. **Tone**: professional but approachable. Keep text VERY SHORT — under 80 words. The UI modules tell the story, not your prose.
5. If the conversation gets complex, suggest scheduling a call with a human expert.

## CANVAS-FIRST GENERATIVE UI

You render into a full-screen canvas. You have tools that deploy rich interactive UI modules:
service_spotlight, comparison_table, roi_calculator, case_study, timeline, pricing_tier, process_flow.

Rules:
- Write 1-2 short sentences of context FIRST, then call at most ONE module tool per response.
- Generate realistic, contextually relevant data for the module you deploy.
- Call \`suggest_replies\` with 2-4 short options (under 6 words each) whenever you ask a question.
- Never describe the tools or mention that you are calling them.`;

function buildWizardPrompt(ctx: WizardContext | undefined): string {
  if (!ctx) return "";
  const step = ctx.currentStep;
  const filled = Object.entries(ctx.collectedData || {})
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  const unfilled = step.fields
    .filter((f) => !ctx.collectedData[f.id])
    .map((f) => `${f.id} (${f.label})`)
    .join(", ");

  return `

WIZARD MODE ACTIVE — "${ctx.wizardId}" step ${ctx.stepIndex + 1}/${ctx.totalSteps}: "${step.title}"
Already collected: ${filled || "none"}
Still needed on this step: ${unfilled || "all filled"}

- Collect the unfilled fields conversationally, one or two at a time.
- Whenever the visitor gives information matching a field, call the \`update_wizard_fields\` tool with those field ids and values.
- When a step is fully filled, invite them to continue to the next step.`;
}

const LEAD_EXTRACTION_PROMPT = `Analyze this conversation and extract any lead information mentioned. Return ONLY a valid JSON object with these fields (use null for missing):
{"email":null,"company":null,"name":null,"budget_range":null,"timeline":null,"intent_category":null}
intent_category must be one of: commerce, automation, infrastructure, ai_support, data_intelligence, generative_ui.
Return ONLY the JSON, no markdown, no explanation.`;

type SupabaseClient = ReturnType<typeof createClient>;

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p: { type: string }) => p.type === "text")
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
}

async function extractLeadDataAI(
  supabase: SupabaseClient,
  sessionId: string,
  transcript: string,
  apiKey: string,
) {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: LEAD_EXTRACTION_PROMPT },
          { role: "user", content: transcript },
        ],
        stream: false,
      }),
    });
    if (!response.ok) {
      console.error("Lead extraction failed:", response.status, await response.text());
      return;
    }
    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content?.trim();
    if (!raw) return;
    const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
    const leadData = JSON.parse(jsonStr) as Record<string, string | null>;

    const cleanData: Record<string, string> = {};
    for (const [k, v] of Object.entries(leadData)) {
      if (v != null && v !== "") cleanData[k] = v;
    }
    if (Object.keys(cleanData).length === 0) return;
    await upsertLead(supabase, sessionId, cleanData);
  } catch (e) {
    console.error("Lead extraction error:", e);
  }
}

async function upsertLead(supabase: SupabaseClient, sessionId: string, data: Record<string, string>) {
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("leads").update(data).eq("session_id", sessionId)
    : await supabase.from("leads").insert({ session_id: sessionId, ...data });

  if (error) console.error("Lead upsert error:", error.message);
}

async function trackEvent(
  supabase: SupabaseClient,
  sessionId: string,
  eventType: string,
  moduleType?: string,
  metadata?: Record<string, unknown>,
) {
  const { error } = await supabase.from("chat_analytics").insert({
    session_id: sessionId,
    event_type: eventType,
    module_type: moduleType || null,
    metadata: metadata || {},
  });
  if (error) console.error("Analytics error:", error.message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // History endpoint
    if (url.searchParams.get("history") === "true") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) {
        return new Response(JSON.stringify({ messages: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(100);

      return new Response(JSON.stringify({ messages: msgs || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analytics-only endpoint
    if (url.searchParams.get("analytics") === "true") {
      const body = await req.json();
      await trackEvent(supabase, body.sessionId, body.eventType, body.moduleType, body.metadata);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const messages = (body.messages ?? []) as UIMessage[];
    const sessionId: string | undefined = body.sessionId;
    const wizardContext: WizardContext | undefined = body.wizardContext;

    const lastMessage = messages[messages.length - 1];
    const userCount = messages.filter((m) => m.role === "user").length;

    if (sessionId && lastMessage?.role === "user") {
      const content = textOf(lastMessage);
      if (content) {
        const { error } = await supabase
          .from("chat_messages")
          .insert({ session_id: sessionId, role: "user", content });
        if (error) console.error("Save user msg error:", error.message);
      }
      if (userCount <= 1) trackEvent(supabase, sessionId, "session_start").catch(() => {});
      trackEvent(supabase, sessionId, "message_sent", undefined, {
        messageCount: messages.length,
      }).catch(() => {});
    }

    if (sessionId && messages.length >= 4) {
      const transcript = messages.map((m) => `${m.role}: ${textOf(m)}`).join("\n");
      extractLeadDataAI(supabase, sessionId, transcript, LOVABLE_API_KEY).catch(() => {});
    }

    const initialRunId = getLovableAiGatewayRunId(req);
    const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY, initialRunId);

    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: BASE_SYSTEM_PROMPT + buildWizardPrompt(wizardContext),
      messages: await convertToModelMessages(messages),
      tools: genuiTools,
      stopWhen: stepCountIs(3),
      onError: ({ error }) => console.error("streamText error:", error),
    });

    const response = result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        if (!sessionId || !responseMessage) return;
        const parts = responseMessage.parts ?? [];
        const { error } = await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: JSON.stringify(parts),
        });
        if (error) console.error("Save assistant msg error:", error.message);

        for (const part of parts as Array<{ type: string; input?: unknown }>) {
          const toolName = part.type.startsWith("tool-") ? part.type.slice(5) : null;
          if (toolName && (moduleToolNames as readonly string[]).includes(toolName)) {
            trackEvent(supabase, sessionId, "module_deployed", toolName).catch(() => {});
          }
        }
      },
      headers: getLovableAiGatewayResponseHeaders(undefined, {
        ...corsHeaders,
        ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
      }),
    });

    return await withLovableAiGatewayRunIdHeader(response, gateway, corsHeaders);
  } catch (e) {
    console.error("chat error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("429") ? 429 : message.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
