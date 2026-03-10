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

4. **Tone**: Professional but approachable. Use concise, clear language. Avoid jargon unless the visitor uses it first. Keep responses VERY SHORT — under 80 words. The UI modules tell the story, not your text.

5. **Always mention**: If the conversation gets complex, suggest scheduling a call with a human expert.

6. **CANVAS-FIRST**: You are rendering in a full-screen canvas layout. Your modules get FULL WIDTH. Deploy a module in EVERY response when possible — lead with visual UI, not walls of text. The user experience is UI-driven. Prefer deploying a module first, then adding 1-2 sentences of context.

Do NOT ask for all qualifying information at once. Spread it naturally across the conversation.

## POLYMORPHIC GenUI — DEPLOY INTERACTIVE MODULES

You can deploy rich interactive UI modules inline in the chat by emitting special markers. Use these ONLY when they add genuine value — not every response needs a module.

Available modules and their JSON schemas:

1. **service_spotlight** — When user mentions a specific service area
   [DEPLOY_MODULE:service_spotlight:{"serviceId":"ai_support","title":"AI Customer Support","description":"Intelligent agents that handle 80% of queries autonomously","features":["24/7 availability","Multi-language","Human escalation"],"highlight":"80% automation","useCases":["E-commerce","SaaS","Healthcare"]}]

2. **comparison_table** — When user asks to compare options
   [DEPLOY_MODULE:comparison_table:{"title":"Plan Comparison","columns":[{"name":"Starter"},{"name":"Growth","recommended":true},{"name":"Enterprise"}],"rows":[{"feature":"AI Agents","values":["1","5","Unlimited"]},{"feature":"Analytics","values":[false,true,true]}]}]

3. **roi_calculator** — When user discusses costs/budget/savings
   [DEPLOY_MODULE:roi_calculator:{"title":"Support Cost Savings","baselineCostPerUnit":12,"automatedCostPerUnit":3,"unitLabel":"tickets","defaultVolume":500,"maxVolume":5000,"currency":"$"}]

4. **case_study** — When user asks about results/past work
   [DEPLOY_MODULE:case_study:{"title":"E-Commerce Automation","client":"RetailCo","industry":"Retail","challenge":"Manual order processing taking 6 hours daily","result":"Fully automated pipeline processing 2000 orders/day","metrics":[{"label":"Time saved","value":"92%"},{"label":"Error rate","value":"0.1%"},{"label":"ROI","value":"340%"}]}]

5. **timeline** — When user asks about delivery/project timeline
   [DEPLOY_MODULE:timeline:{"title":"Project Timeline","totalWeeks":12,"phases":[{"name":"Discovery","weeks":2,"description":"Requirements gathering & architecture"},{"name":"Build","weeks":6,"description":"Core development & integrations"},{"name":"Testing","weeks":2,"description":"QA, load testing, UAT"},{"name":"Launch","weeks":2,"description":"Deployment & monitoring"}]}]

6. **pricing_tier** — When user asks about pricing
   [DEPLOY_MODULE:pricing_tier:{"title":"Service Tiers","tiers":[{"name":"Starter","price":"$2,500","period":"month","features":["1 AI agent","Basic analytics","Email support"]},{"name":"Growth","price":"$7,500","period":"month","features":["5 AI agents","Advanced analytics","Priority support","Custom integrations"],"recommended":true},{"name":"Enterprise","price":"Custom","period":"month","features":["Unlimited agents","Full platform","Dedicated team","SLA guarantee"]}]}]

7. **process_flow** — When user asks "how does it work?"
   [DEPLOY_MODULE:process_flow:{"title":"How It Works","steps":[{"name":"Discovery Call","description":"We understand your needs and pain points"},{"name":"Solution Design","description":"Architecture and prototype in 1 week"},{"name":"Build & Iterate","description":"Agile sprints with weekly demos"},{"name":"Launch & Monitor","description":"Zero-downtime deployment with 24/7 monitoring"}]}]

RULES:
- Deploy AT MOST one module per response
- Generate realistic, contextually relevant data for each module
- The module marker must be on its own line, NOT inside markdown formatting
- Always accompany a module with a brief text explanation
- Use the serviceId values: commerce, automation, infrastructure, ai_support, data_intelligence, generative_ui

## QUICK-REPLY SUGGESTIONS

When you ask the user a question or present options, ALWAYS end your response with a suggestions marker on its own line:
[SUGGESTIONS:["Option A","Option B","Option C"]]

Rules for suggestions:
- Provide 2-4 contextually relevant quick-reply options
- Keep each option under 6 words
- Make them specific to your question (not generic)
- Examples:
  - After asking about budget: [SUGGESTIONS:["Under $10k","$10k-$50k","$50k+","Not sure yet"]]
  - After asking about timeline: [SUGGESTIONS:["ASAP","1-3 months","3-6 months","Just exploring"]]
  - After asking about services: [SUGGESTIONS:["AI Support","Automation","E-Commerce","Data Analytics"]]
- The marker must be on its own line, NOT inside markdown`;

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

async function extractLeadData(supabase: any, sessionId: string, messages: any[]) {
  const fullConvo = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");

  const emailMatch = fullConvo.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  const budgetMatch = fullConvo.match(/\$[\d,]+[kK]?[\s-]*(?:\$[\d,]+[kK]?)?|under \$[\d,]+|(?:budget|spend)[^\n]*?(\$[\d,]+[kK]?)/i);
  const timelineMatch = fullConvo.match(/(?:ASAP|(?:\d+[-–]\d+\s*months?)|(?:next\s+(?:month|quarter|year))|(?:within\s+\d+\s*(?:weeks?|months?)))/i);
  const companyMatch = fullConvo.match(/(?:company|organization|we(?:'re| are))\s+(?:is\s+|called\s+)?["']?([A-Z][\w\s&]+?)["']?(?:\.|,|\s+and|\s+we|\s+based)/i);
  const nameMatch = fullConvo.match(/(?:(?:my name is|I'm|I am)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);

  const intentCategories = ["commerce", "automation", "infrastructure", "ai_support", "data_intelligence", "generative_ui"];
  const intentMatch = intentCategories.find((cat) =>
    fullConvo.toLowerCase().includes(cat.replace("_", " "))
  );

  const leadData: Record<string, string | null> = {};
  if (emailMatch) leadData.email = emailMatch[0];
  if (budgetMatch) leadData.budget_range = budgetMatch[0].trim();
  if (timelineMatch) leadData.timeline = timelineMatch[0].trim();
  if (companyMatch) leadData.company = companyMatch[1]?.trim() || null;
  if (nameMatch) leadData.name = nameMatch[1]?.trim() || null;
  if (intentMatch) leadData.intent_category = intentMatch;

  if (Object.values(leadData).some((v) => v)) {
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existing) {
      await supabase.from("leads").update(leadData).eq("session_id", sessionId);
    } else {
      await supabase.from("leads").insert({ session_id: sessionId, ...leadData });
    }
  }
}

async function trackEvent(supabase: any, sessionId: string, eventType: string, moduleType?: string, metadata?: Record<string, any>) {
  await supabase.from("chat_analytics").insert({
    session_id: sessionId,
    event_type: eventType,
    module_type: moduleType || null,
    metadata: metadata || {},
  }).then(() => {}).catch((e: any) => console.error("Analytics error:", e));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // History endpoint: GET ?history=true&sessionId=xxx
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

    // Main chat endpoint
    const { messages, sessionId, wizardContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lastUserMsg = messages[messages.length - 1];
    const isFirstMessage = messages.filter((m: any) => m.role === "user").length <= 1;

    if (lastUserMsg?.role === "user" && sessionId) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: lastUserMsg.content,
      });

      // Track session_start on first message
      if (isFirstMessage) {
        trackEvent(supabase, sessionId, "session_start").catch(() => {});
      }
      trackEvent(supabase, sessionId, "message_sent", undefined, { messageCount: messages.length }).catch(() => {});
    }

    // Auto-extract lead data from conversation history
    if (sessionId && messages.length >= 4) {
      extractLeadData(supabase, sessionId, messages).catch((e) =>
        console.error("Lead extraction error:", e)
      );
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

    // Stream the response but also collect it to save to DB
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    let fullAssistantText = "";

    (async () => {
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);

          // Collect text for DB storage
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullAssistantText += content;
            } catch {}
          }
        }
      } finally {
        await writer.close();

        // Save assistant response to DB
        if (sessionId && fullAssistantText) {
          supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: fullAssistantText,
          }).then(() => {}).catch((e: any) => console.error("Save assistant msg error:", e));

          // Track module deployments
          const moduleMatches = fullAssistantText.matchAll(/\[DEPLOY_MODULE:(\w+):/g);
          for (const match of moduleMatches) {
            trackEvent(supabase, sessionId, "module_deployed", match[1]).catch(() => {});
          }
        }
      }
    })();

    return new Response(readable, {
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
