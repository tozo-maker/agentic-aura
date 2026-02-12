import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_SYSTEM_PROMPT = `You are the Nexus AI Consultant — a sophisticated, warm, and professional AI agent for a hybrid intelligence agency called Nexus AI.

Your role is to qualify leads by understanding their needs and extracting key information through natural conversation. You should:

1. **Understand intent**: Classify the visitor's need into one of these categories:
   - Commerce (headless storefronts, e-commerce)
   - Automation (workflow automation, process optimization)
   - Infrastructure (hosting, DevOps, self-healing systems)
   - AI Support (customer support agents, chatbots)
   - Data Intelligence (reporting, analytics)
   - Generative UI (adaptive interfaces)

2. **Qualify the lead**: Naturally ask about:
   - Their company/project name
   - Budget range (e.g., "under $10k", "$10-50k", "$50k+")
   - Timeline (e.g., "ASAP", "1-3 months", "3-6 months")
   - Specific pain points

3. **Be helpful**: Provide genuine insights about how hybrid automation (AI + human verification) can solve their problems. Reference specific Nexus AI services when relevant.

4. **Tone**: Professional but approachable. Use concise, clear language. Avoid jargon unless the visitor uses it first. Keep responses under 150 words.

5. **Always mention**: If the conversation gets complex, suggest scheduling a call with a human expert.

Do NOT ask for all qualifying information at once. Spread it naturally across the conversation.`;

function buildWizardPrompt(ctx: any): string {
  if (!ctx) return "";

  const step = ctx.currentStep;
  const filled = Object.entries(ctx.collectedData || {})
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  const unfilled = step.fields
    .filter((f: any) => !ctx.collectedData[f.id])
    .map((f: any) => `${f.id} (${f.label})`)
    .join(", ");

  return `

WIZARD MODE ACTIVE — "${ctx.wizardId}" step ${ctx.stepIndex + 1}/${ctx.totalSteps}: "${step.title}"

Already collected: ${filled || "none"}
Still needed on this step: ${unfilled || "all filled"}

INSTRUCTIONS:
- Your goal is to naturally collect the unfilled fields through conversation.
- When the user provides information that maps to a field, emit a marker like [FIELD_UPDATE:field_id=value] in your response.
- Example: if user says "We're Acme Corp", respond naturally AND include [FIELD_UPDATE:company_name=Acme Corp] somewhere in your text.
- You can emit multiple markers in one response.
- Keep asking about unfilled fields naturally — don't list them all at once.
- When a step's fields are all filled, encourage the user to click "Next" on the wizard.
- When [WIZARD_COMPLETE] is received, summarize all collected data and suggest next steps.
- NEVER show the [FIELD_UPDATE:...] markers as visible text to the user — they are parsed by the frontend.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, wizardContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user" && sessionId) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: lastUserMsg.content,
      });
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + buildWizardPrompt(wizardContext);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
