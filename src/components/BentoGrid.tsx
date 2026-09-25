import { motion } from "framer-motion";
import { ShoppingCart, Cog, Layers, Server, Headphones, BarChart3, ArrowRight, Check, UserCheck } from "lucide-react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: ShoppingCart,
    title: "Agentic Commerce",
    id: "commerce",
    description: "Headless Medusa v2 storefronts with AI-powered product discovery, dynamic pricing, and autonomous inventory management.",
    steps: ["Read product and inventory context", "Draft the next best action", "Request approval before execution"],
  },
  {
    icon: Cog,
    title: "Workflow Automation",
    id: "automation",
    description: "n8n-powered business process automation that eliminates manual data entry and connects your entire tool stack.",
    steps: ["Map the current handoffs", "Identify repeatable decisions", "Deploy with exception routing"],
  },
  {
    icon: Layers,
    title: "Generative UI",
    id: "generative_ui",
    description: "Interfaces that adapt in real-time based on user behavior, context, and intent—every visitor gets a unique experience.",
    steps: ["Interpret visitor intent", "Compose the right interface", "Keep actions within set rules"],
  },
  {
    icon: Server,
    title: "Self-Healing Infrastructure",
    id: "infrastructure",
    description: "Dockerized sovereign hosting with automated failover, uptime monitoring, and zero-downtime deployments.",
    steps: ["Monitor service health", "Prepare a recovery action", "Escalate material changes"],
  },
  {
    icon: Headphones,
    title: "AI Customer Support",
    id: "ai_support",
    description: "Support agents that handle routine requests and route sensitive or complex cases to the right person.",
    steps: ["Understand the request", "Use approved knowledge", "Escalate when confidence is low"],
  },
  {
    icon: BarChart3,
    title: "Data Intelligence",
    id: "data_intelligence",
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
            <span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-primary">What Nexus builds</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal mt-4 text-foreground">From a bottleneck to a working system.</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground md:max-w-sm md:justify-self-end">Explore how each system moves from context to action while preserving a clear human decision point.</p>
        </motion.div>

        <div className="grid border border-border lg:grid-cols-[0.82fr_1.18fr]">
          <div className="divide-y divide-border border-b border-border lg:border-b-0 lg:border-r">
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
                  isActive ? "bg-secondary" : "bg-background hover:bg-secondary/45"
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-4">
                <div className={`w-9 h-9 border flex items-center justify-center transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                  <service.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">0{i + 1}</p>
                  <h3 className="text-base font-sans font-medium text-foreground">{service.title}</h3>
                </div>
                <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? "translate-x-0 text-primary" : "-translate-x-1 text-muted-foreground"}`} />
                </div>
              </motion.button>
            );
          })}
          </div>

          <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="bg-card p-6 sm:p-9 lg:p-12">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-primary"><selected.icon className="h-4 w-4" /> Working model</div>
            <h3 className="mt-5 text-3xl sm:text-4xl font-serif text-foreground">{selected.title}</h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {selected.steps.map((step, index) => (
                <div key={step} className="flex items-center gap-4 py-4">
                  <span className="flex h-7 w-7 items-center justify-center border border-border text-[10px] text-muted-foreground">0{index + 1}</span>
                  <span className="flex-1 text-sm text-foreground">{step}</span>
                  {index === selected.steps.length - 1 ? <UserCheck className="h-4 w-4 text-accent" /> : <Check className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>
            <Button className="mt-8" onClick={() => onOpenChat?.(`Help me explore ${selected.title}`, selected.id)}>
              Explore this system <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

BentoGrid.displayName = "BentoGrid";

export default BentoGrid;
