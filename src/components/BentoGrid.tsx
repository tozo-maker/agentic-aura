import { motion } from "framer-motion";
import { ShoppingCart, Cog, Layers, Server, Headphones, BarChart3, ArrowRight } from "lucide-react";
import { forwardRef } from "react";

const services = [
  {
    icon: ShoppingCart,
    title: "Agentic Commerce",
    id: "commerce",
    description: "Headless Medusa v2 storefronts with AI-powered product discovery, dynamic pricing, and autonomous inventory management.",
    span: "md:col-span-2",
  },
  {
    icon: Cog,
    title: "Workflow Automation",
    id: "automation",
    description: "n8n-powered business process automation that eliminates manual data entry and connects your entire tool stack.",
    span: "",
  },
  {
    icon: Layers,
    title: "Generative UI",
    id: "generative_ui",
    description: "Interfaces that adapt in real-time based on user behavior, context, and intent—every visitor gets a unique experience.",
    span: "",
  },
  {
    icon: Server,
    title: "Self-Healing Infrastructure",
    id: "infrastructure",
    description: "Dockerized sovereign hosting with automated failover, uptime monitoring, and zero-downtime deployments.",
    span: "md:col-span-2",
  },
  {
    icon: Headphones,
    title: "AI Customer Support",
    id: "ai_support",
    description: "Intelligent support agents that resolve 80% of queries autonomously, with seamless human escalation for complex cases.",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Data Intelligence",
    id: "data_intelligence",
    description: "Automated reporting pipelines that transform raw data into actionable business insights, delivered on your schedule.",
    span: "",
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
  return (
    <section ref={ref} id="services" className="py-24 px-6 bg-secondary/35 border-b border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid md:grid-cols-2 gap-6 items-end mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-primary">Capabilities / 01—06</span>
            <h2 className="text-5xl md:text-6xl font-serif font-normal mt-4 text-foreground">Systems that move work forward.</h2>
          </div>
          <p className="text-sm text-muted-foreground md:max-w-sm md:justify-self-end">Select a capability to open a focused consultation with context already loaded.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {services.map((service, i) => {
            const isActive = activeService && service.id === activeService;
            return (
              <motion.div
                key={service.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                onClick={() => onOpenChat?.(`Tell me more about ${service.title}`, service.id)}
                className={`bg-background p-7 md:p-8 min-h-64 cursor-pointer group ${service.span} transition-all duration-300 ${
                  isActive ? "ring-2 ring-primary ring-inset" : "hover:bg-card"
                }`}
              >
                <div className="flex items-start justify-between mb-12">
                <div className={`w-10 h-10 rounded-md bg-secondary flex items-center justify-center transition-all duration-300 ${
                  isActive ? "bg-primary" : "group-hover:bg-primary"
                }`}>
                  <service.icon className={`w-5 h-5 transition-all duration-500 ${
                    isActive ? "text-primary-foreground" : "text-foreground group-hover:text-primary-foreground"
                  }`} />
                </div>
                <span className="text-xs font-sans text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="text-2xl font-serif font-normal text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-primary opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  Open consultation <ArrowRight className="w-3 h-3" />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

BentoGrid.displayName = "BentoGrid";

export default BentoGrid;
