export interface WizardFieldOption {
  label: string;
  value: string;
}

export interface WizardField {
  id: string;
  type: "text" | "select" | "radio" | "textarea" | "email" | "range";
  label: string;
  options?: WizardFieldOption[];
  required?: boolean;
  placeholder?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  fields: WizardField[];
}

export interface WizardSchema {
  id: string;
  title: string;
  steps: WizardStep[];
}

export const wizardSchemas: Record<string, WizardSchema> = {
  support_assessment: {
    id: "support_assessment",
    title: "Support Cost Assessment",
    steps: [
      {
        id: "pain_points",
        title: "Current Challenges",
        fields: [
          { id: "company_name", type: "text", label: "Company name", required: true, placeholder: "Acme Inc." },
          {
            id: "main_pain",
            type: "radio",
            label: "Primary pain point",
            required: true,
            options: [
              { label: "High ticket volume", value: "ticket_volume" },
              { label: "Slow response times", value: "slow_response" },
              { label: "Repetitive questions", value: "repetitive" },
              { label: "Agent burnout", value: "burnout" },
            ],
          },
        ],
      },
      {
        id: "volume",
        title: "Support Volume",
        fields: [
          {
            id: "monthly_tickets",
            type: "select",
            label: "Monthly support tickets",
            required: true,
            options: [
              { label: "Under 500", value: "<500" },
              { label: "500 – 2,000", value: "500-2000" },
              { label: "2,000 – 10,000", value: "2000-10000" },
              { label: "10,000+", value: "10000+" },
            ],
          },
          { id: "current_tools", type: "text", label: "Current support tools", placeholder: "Zendesk, Intercom, etc." },
        ],
      },
      {
        id: "budget",
        title: "Budget & Timeline",
        fields: [
          {
            id: "budget_range",
            type: "radio",
            label: "Budget range",
            required: true,
            options: [
              { label: "Under $10k", value: "<10k" },
              { label: "$10k – $50k", value: "10-50k" },
              { label: "$50k+", value: "50k+" },
            ],
          },
          {
            id: "timeline",
            type: "radio",
            label: "Desired timeline",
            required: true,
            options: [
              { label: "ASAP", value: "asap" },
              { label: "1–3 months", value: "1-3m" },
              { label: "3–6 months", value: "3-6m" },
            ],
          },
        ],
      },
    ],
  },

  automation_scoping: {
    id: "automation_scoping",
    title: "Automation Scoping",
    steps: [
      {
        id: "process",
        title: "Your Process",
        fields: [
          { id: "company_name", type: "text", label: "Company name", required: true, placeholder: "Acme Inc." },
          { id: "process_desc", type: "textarea", label: "Describe the process to automate", required: true, placeholder: "e.g. Purchase order approvals…" },
        ],
      },
      {
        id: "details",
        title: "Process Details",
        fields: [
          {
            id: "frequency",
            type: "select",
            label: "How often does this run?",
            required: true,
            options: [
              { label: "Multiple times/day", value: "daily_multi" },
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ],
          },
          {
            id: "team_size",
            type: "radio",
            label: "Team size involved",
            required: true,
            options: [
              { label: "1–5", value: "1-5" },
              { label: "6–20", value: "6-20" },
              { label: "20+", value: "20+" },
            ],
          },
        ],
      },
      {
        id: "budget",
        title: "Budget & Timeline",
        fields: [
          {
            id: "budget_range",
            type: "radio",
            label: "Budget range",
            required: true,
            options: [
              { label: "Under $10k", value: "<10k" },
              { label: "$10k – $50k", value: "10-50k" },
              { label: "$50k+", value: "50k+" },
            ],
          },
          {
            id: "timeline",
            type: "radio",
            label: "Desired timeline",
            required: true,
            options: [
              { label: "ASAP", value: "asap" },
              { label: "1–3 months", value: "1-3m" },
              { label: "3–6 months", value: "3-6m" },
            ],
          },
        ],
      },
    ],
  },

  commerce_wizard: {
    id: "commerce_wizard",
    title: "Commerce Assessment",
    steps: [
      {
        id: "current",
        title: "Current Setup",
        fields: [
          { id: "company_name", type: "text", label: "Company name", required: true, placeholder: "Acme Inc." },
          { id: "current_platform", type: "text", label: "Current platform", placeholder: "Shopify, WooCommerce, custom…" },
        ],
      },
      {
        id: "scale",
        title: "Scale & Needs",
        fields: [
          {
            id: "sku_count",
            type: "select",
            label: "Number of SKUs",
            required: true,
            options: [
              { label: "Under 100", value: "<100" },
              { label: "100 – 1,000", value: "100-1000" },
              { label: "1,000 – 10,000", value: "1000-10000" },
              { label: "10,000+", value: "10000+" },
            ],
          },
          { id: "integrations", type: "text", label: "Key integrations needed", placeholder: "ERP, CRM, PIM…" },
        ],
      },
      {
        id: "budget",
        title: "Budget & Timeline",
        fields: [
          {
            id: "budget_range",
            type: "radio",
            label: "Budget range",
            required: true,
            options: [
              { label: "Under $10k", value: "<10k" },
              { label: "$10k – $50k", value: "10-50k" },
              { label: "$50k+", value: "50k+" },
            ],
          },
          {
            id: "timeline",
            type: "radio",
            label: "Desired timeline",
            required: true,
            options: [
              { label: "ASAP", value: "asap" },
              { label: "1–3 months", value: "1-3m" },
              { label: "3–6 months", value: "3-6m" },
            ],
          },
        ],
      },
    ],
  },

  infrastructure_wizard: {
    id: "infrastructure_wizard",
    title: "Infrastructure Assessment",
    steps: [
      {
        id: "current",
        title: "Current Hosting",
        fields: [
          { id: "company_name", type: "text", label: "Company name", required: true, placeholder: "Acme Inc." },
          { id: "current_hosting", type: "text", label: "Current hosting provider", placeholder: "AWS, GCP, on-prem…" },
        ],
      },
      {
        id: "needs",
        title: "Requirements",
        fields: [
          {
            id: "monthly_traffic",
            type: "select",
            label: "Monthly traffic",
            required: true,
            options: [
              { label: "Under 100k visits", value: "<100k" },
              { label: "100k – 1M visits", value: "100k-1m" },
              { label: "1M+ visits", value: "1m+" },
            ],
          },
          {
            id: "uptime_need",
            type: "radio",
            label: "Uptime requirement",
            required: true,
            options: [
              { label: "99.9%", value: "99.9" },
              { label: "99.99%", value: "99.99" },
              { label: "99.999%", value: "99.999" },
            ],
          },
        ],
      },
      {
        id: "budget",
        title: "Budget & Timeline",
        fields: [
          {
            id: "budget_range",
            type: "radio",
            label: "Budget range",
            required: true,
            options: [
              { label: "Under $10k", value: "<10k" },
              { label: "$10k – $50k", value: "10-50k" },
              { label: "$50k+", value: "50k+" },
            ],
          },
          {
            id: "timeline",
            type: "radio",
            label: "Desired timeline",
            required: true,
            options: [
              { label: "ASAP", value: "asap" },
              { label: "1–3 months", value: "1-3m" },
              { label: "3–6 months", value: "3-6m" },
            ],
          },
        ],
      },
    ],
  },
};
