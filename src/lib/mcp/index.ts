import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLeadsTool from "./tools/list-leads";
import getLeadTool from "./tools/get-lead";
import listRecentAnalyticsTool from "./tools/list-recent-analytics";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nexus-ai-mcp",
  title: "Nexus AI MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Nexus AI consultant app. Admins can list qualified leads, fetch a lead's chat transcript, and review recent chat analytics events. All access is scoped to the signed-in admin user via RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listLeadsTool, getLeadTool, listRecentAnalyticsTool],
});
