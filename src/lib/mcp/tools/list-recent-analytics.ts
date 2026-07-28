import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthorized } from "../supabase";

export default defineTool({
  name: "list_recent_analytics",
  title: "List recent chat analytics",
  description:
    "List recent chat analytics events (e.g. module_preloaded) from the consultant. Admin-only.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Max events (default 50)."),
    event_type: z.string().optional().describe("Optional event_type filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, event_type }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthorized();
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("chat_analytics")
      .select("id, session_id, event_type, module_type, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (event_type) q = q.eq("event_type", event_type);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { events: data },
    };
  },
});
