import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const bodySchema = z.object({
  sessionId: z.string().min(8).max(128),
  company: z.string().trim().max(200).optional().nullable(),
  budget_range: z.string().trim().max(100).optional().nullable(),
  timeline: z.string().trim().max(100).optional().nullable(),
  intent_category: z.string().trim().max(100).optional().nullable(),
  name: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { sessionId, ...fields } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    const payload = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    );

    const { error } = existing
      ? await supabase.from("leads").update(payload).eq("id", existing.id)
      : await supabase.from("leads").insert({ session_id: sessionId, ...payload });

    if (error) {
      console.error("submit-lead error", error.message);
      return new Response(JSON.stringify({ error: "Could not save lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-lead exception", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
