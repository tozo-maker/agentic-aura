import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "get_lead",
  title: "Get lead with transcript",
  description:
    "Fetch a single lead with its full chat transcript from the Nexus AI consultant. Admin-only.",
  inputSchema: {
    lead_id: z.string().uuid().describe("The lead's UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ lead_id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);
    const { data: lead, error: leadErr } = await sb
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .maybeSingle();
    if (leadErr) return { content: [{ type: "text", text: leadErr.message }], isError: true };
    if (!lead) return { content: [{ type: "text", text: "Lead not found" }], isError: true };

    const { data: messages, error: msgErr } = await sb
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("session_id", lead.session_id)
      .order("created_at", { ascending: true });
    if (msgErr) return { content: [{ type: "text", text: msgErr.message }], isError: true };

    const payload = { lead, messages: messages ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
