export const SERVICE_MODULE_MAP: Record<string, { type: string; data: Record<string, any> }> = {
  commerce: {
    type: "service_spotlight",
    data: {
      serviceId: "commerce",
      title: "Agentic Commerce",
      description:
        "Headless Medusa v2 storefronts with AI-powered product discovery, dynamic pricing, and autonomous inventory management.",
      features: ["Headless Medusa v2", "AI product discovery", "Dynamic pricing", "Autonomous inventory"],
      highlight: "Full-stack commerce",
      useCases: ["DTC brands", "B2B wholesale", "Marketplace"],
    },
  },
  automation: {
    type: "process_flow",
    data: {
      title: "Workflow Automation",
      steps: [
        { name: "Audit", description: "Map your current manual processes and identify automation opportunities" },
        { name: "Design", description: "Build n8n workflows with AI decision nodes and human checkpoints" },
        { name: "Integrate", description: "Connect your entire tool stack — CRM, ERP, comms, databases" },
        { name: "Monitor", description: "Real-time dashboards with self-healing error recovery" },
      ],
    },
  },
  generative_ui: {
    type: "service_spotlight",
    data: {
      serviceId: "generative_ui",
      title: "Generative UI",
      description: "Interfaces that adapt in real-time based on user behavior, context, and intent.",
      features: ["Adaptive layouts", "Context-aware components", "Real-time personalization", "AI-driven UX"],
      highlight: "Every visitor gets a unique experience",
      useCases: ["SaaS platforms", "E-commerce", "Content sites"],
    },
  },
  infrastructure: {
    type: "service_spotlight",
    data: {
      serviceId: "infrastructure",
      title: "Self-Healing Infrastructure",
      description:
        "Dockerized sovereign hosting with automated failover, uptime monitoring, and zero-downtime deployments.",
      features: ["Docker orchestration", "Auto-failover", "24/7 uptime monitoring", "Zero-downtime deploys"],
      highlight: "99.99% uptime SLA",
      useCases: ["High-traffic apps", "Mission-critical systems", "Multi-region deploys"],
    },
  },
  ai_support: {
    type: "service_spotlight",
    data: {
      serviceId: "ai_support",
      title: "AI Customer Support",
      description:
        "Intelligent support agents that resolve 80% of queries autonomously, with seamless human escalation.",
      features: ["24/7 availability", "Multi-language", "Human escalation", "Sentiment analysis"],
      highlight: "80% automation rate",
      useCases: ["E-commerce", "SaaS", "Healthcare"],
    },
  },
  data_intelligence: {
    type: "service_spotlight",
    data: {
      serviceId: "data_intelligence",
      title: "Data Intelligence",
      description: "Automated reporting pipelines that transform raw data into actionable business insights.",
      features: ["Automated ETL", "Real-time dashboards", "Predictive analytics", "Custom reports"],
      highlight: "Data-driven decisions",
      useCases: ["Business intelligence", "Marketing analytics", "Operations"],
    },
  },
};
