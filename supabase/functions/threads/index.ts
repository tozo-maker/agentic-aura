import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SupabaseClient = ReturnType<typeof createClient>;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId") || undefined;

    // List threads for a session
    if (req.method === "GET") {
      if (!sessionId) return jsonResponse({ threads: [] });
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, status, created_at, updated_at")
        .eq("session_id", sessionId)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return jsonResponse({ threads: data || [] });
    }

    // Create a new thread
    if (req.method === "POST") {
      const body = await req.json();
      if (!body.sessionId) return jsonResponse({ error: "sessionId is required" }, 400);

      const { data, error } = await supabase
        .from("threads")
        .insert({
          session_id: body.sessionId,
          title: body.title || "New conversation",
        })
        .select("id, title, status, created_at, updated_at")
        .single();

      if (error) throw error;
      return jsonResponse({ thread: data });
    }

    // Delete a thread
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return jsonResponse({ error: "id is required" }, 400);

      const { error } = await supabase.from("threads").delete().eq("id", id);
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (e) {
    console.error("threads error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
