import { z } from "npm:zod@4";
import { tool } from "npm:ai@7";

/**
 * GenUI module tools. These have NO `execute` — the model calls them, the stream
 * ends with the tool input available, and the browser renders the module from
 * that structured input. No text markers, no regex parsing.
 */

const serviceIds = ["commerce", "automation", "infrastructure", "ai_support", "data_intelligence", "generative_ui"] as const;

export const moduleToolNames = [
  "service_spotlight",
  "comparison_table",
  "roi_calculator",
  "case_study",
  "timeline",
  "pricing_tier",
  "process_flow",
] as const;

export const genuiTools = {
  service_spotlight: tool({
    description: "Show a rich spotlight card for one Nexus AI service. Use when the visitor mentions a specific service area.",
    inputSchema: z.object({
      serviceId: z.enum(serviceIds),
      title: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      highlight: z.string(),
      useCases: z.array(z.string()),
    }),
  }),

  comparison_table: tool({
    description: "Render a comparison table. Use when the visitor asks to compare plans, options or approaches.",
    inputSchema: z.object({
      title: z.string(),
      columns: z.array(z.object({ name: z.string(), recommended: z.boolean().nullable() })),
      rows: z.array(
        z.object({
          feature: z.string(),
          values: z.array(z.string()),
        }),
      ),
    }),
  }),

  roi_calculator: tool({
    description: "Render an interactive ROI / savings calculator. Use when the visitor discusses cost, budget or savings.",
    inputSchema: z.object({
      title: z.string(),
      baselineCostPerUnit: z.number(),
      automatedCostPerUnit: z.number(),
      unitLabel: z.string(),
      defaultVolume: z.number(),
      maxVolume: z.number(),
      currency: z.string(),
    }),
  }),

  case_study: tool({
    description: "Render a case study card. Use when the visitor asks about results, proof or past work.",
    inputSchema: z.object({
      title: z.string(),
      client: z.string(),
      industry: z.string(),
      challenge: z.string(),
      result: z.string(),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
  }),

  timeline: tool({
    description: "Render a phased project timeline. Use when the visitor asks about delivery or duration.",
    inputSchema: z.object({
      title: z.string(),
      totalWeeks: z.number(),
      phases: z.array(z.object({ name: z.string(), weeks: z.number(), description: z.string() })),
    }),
  }),

  pricing_tier: tool({
    description: "Render pricing tiers. Use when the visitor asks about pricing or packages.",
    inputSchema: z.object({
      title: z.string(),
      tiers: z.array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          recommended: z.boolean().nullable(),
        }),
      ),
    }),
  }),

  process_flow: tool({
    description: 'Render a step-by-step process flow. Use when the visitor asks "how does it work?".',
    inputSchema: z.object({
      title: z.string(),
      steps: z.array(z.object({ name: z.string(), description: z.string() })),
    }),
  }),

  suggest_replies: tool({
    description:
      "Offer 2-4 short quick-reply chips. Call this whenever you ask the visitor a question so they can answer with one tap.",
    inputSchema: z.object({
      suggestions: z.array(z.string()),
    }),
  }),

  update_wizard_fields: tool({
    description:
      "Fill fields in the active lead wizard when the visitor provides information that maps to a wizard field. Only call while a wizard is active.",
    inputSchema: z.object({
      fields: z.array(z.object({ id: z.string(), value: z.string() })),
    }),
  }),
};

export const captureLeadSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  company: z.string().nullable(),
  budget_range: z.string().nullable(),
  timeline: z.string().nullable(),
  intent_category: z.enum(serviceIds).nullable(),
});
