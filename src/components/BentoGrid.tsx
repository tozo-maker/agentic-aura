import { motion } from "framer-motion";
import { ShoppingCart, Cog, Layers, Server, Headphones, BarChart3, ArrowRight } from "lucide-react";
import { forwardRef, useState } from "react";
import SystemEmulator from "@/components/SystemEmulator";

const services = [
  {
    icon: ShoppingCart,
    title: "Agentic Commerce",
    id: "commerce",
    logs: ["inventory.read → 3 SKUs below reorder point", "pricing.draft → suggest restock order for 3 SKUs", "gate → purchase order held for buyer sign-off"],
    description: "Headless Medusa v2 storefronts with AI-powered product discovery, dynamic pricing, and autonomous inventory management.",
    steps: ["Read product and inventory context", "Draft the next best action", "Request approval before execution"],
  },
  {
    icon: Cog,
    title: "Workflow Automation",
    id: "automation",
    logs: ["handoffs.map → 7 manual steps found in order intake", "rules.detect → 4 steps follow a repeatable rule", "gate → new workflow held for owner approval"],
    description: "n8n-powered business process automation that eliminates manual data entry and connects your entire tool stack.",
    steps: ["Map the current handoffs", "Identify repeatable decisions", "Deploy with exception routing"],
  },
  {
    icon: Layers,
    title: "Generative UI",
    id: "generative_ui",
    logs: ["intent.read → visitor comparing plans", "ui.compose → render comparison view", "gate → layout change checked against brand rules"],
    description: "Interfaces that adapt in real-time based on user behavior, context, and intent—every visitor gets a unique experience.",
    steps: ["Interpret visitor intent", "Compose the right interface", "Keep actions within set rules"],
  },
  {
    icon: Server,
    title: "Self-Healing Infrastructure",
    id: "infrastructure",
    logs: ["health.check → API latency above threshold", "recovery.prepare → restart plan for 1 service", "gate → restart held for on-call engineer"],
    description: "Dockerized sovereign hosting with automated failover, uptime monitoring, and zero-downtime deployments.",
    steps: ["Monitor service health", "Prepare a recovery action", "Escalate material changes"],
  },
  {
    icon: Headphones,
    title: "AI Customer Support",
    id: "ai_support",
    logs: ["ticket.read → billing dispute, high value", "knowledge.match → 2 approved policy answers", "gate → reply held for support lead review"],
    description: "Support agents that handle routine requests and route sensitive or complex cases to the right person.",
    steps: ["Understand the request", "Use approved knowledge", "Escalate when confidence is low"],
  },
  {
    icon: BarChart3,
    title: "Data Intelligence",
    id: "data_intelligence",
    logs: ["sources.sync → 3 tools unified", "changes.detect → weekly revenue shift flagged", "gate → report held for analyst sign-off"],
    description: "Automated reporting pipelines that transform raw data into actionable business insights, delivered on your schedule.",
    steps: ["Unify operational data", "Surface material changes", "Deliver decision-ready reporting"],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

interface BentoGridProps {
  activeService?: string | null;
  onOpenChat?: (intent: string, serviceId?: string) => void;
}

const BentoGrid = forwardRef<HTMLElement, BentoGridProps>(({ activeService, onOpenChat }, ref) => {
  const [selectedId, setSelectedId] = useState(activeService || services[0].id);
  const selected = services.find((service) => service.id === selectedId) ?? services[0];

  return (
    <section ref={ref} id="services" className="py-20 sm:py-28 px-5 border-b border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-[1.25fr_.75fr] gap-6 items-end mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-accent font-mono">What Nexus builds</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal mt-4 text-foreground">From a bottleneck to a working system.</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground md:max-w-sm md:justify-self-end">Pick a system and run it. Each one moves from context to action, then stops for a person before anything sensitive happens.</p>
        </motion.div>

        <div className="chassis grid overflow-hidden p-2 gap-2 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-1.5">
          {services.map((service, i) => {
            const isActive = service.id === selectedId;
            return (
              <motion.button
                key={service.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onClick={() => setSelectedId(service.id)}
                className={`w-full p-5 text-left group transition-colors ${
                  isActive ? "inset-well" : "rounded-[var(--radius)] hover:bg-background/60"
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-4">
                <div className={`w-9 h-9 border flex items-center justify-center transition-colors ${isActive ? "rounded-md border-accent bg-accent text-accent-foreground" : "rounded-md border-border text-muted-foreground"}`}>
                  <service.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">SYS.0{i + 1}</p>
                  <h3 className="text-base font-sans font-medium text-foreground">{service.title}</h3>
                </div>
                <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "translate-x-0 text-primary" : "-translate-x-1 text-muted-foreground"}`} />
                </div>
              </motion.button>
            );
          })}
          </div>

          <SystemEmulator system={selected} onConsult={() => onOpenChat?.(`Help me plan ${selected.title} for my business`, selected.id)} />
        </div>
      </div>
    </section>
  );
});

BentoGrid.displayName = "BentoGrid";

export default BentoGrid;
