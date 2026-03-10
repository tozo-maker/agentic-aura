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
    <section ref={ref} id="services" className="py-24 px-6 noise-overlay">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground">
            What We Build
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mt-4 text-foreground">
            The Service Catalog
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                onClick={() => onOpenChat?.(`Tell me more about ${service.title}`, service.id)}
                className={`glass rounded-2xl p-6 cursor-pointer group ${service.span} transition-all duration-500 ${
                  isActive ? "ring-2 ring-foreground/20 shadow-[0_0_30px_hsl(var(--foreground)/0.08)]" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 transition-all duration-500 ${
                  isActive ? "bg-foreground" : "group-hover:bg-foreground"
                }`}>
                  <service.icon className={`w-5 h-5 transition-all duration-500 ${
                    isActive ? "text-primary-foreground" : "text-foreground group-hover:text-primary-foreground"
                  }`} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowRight className="w-3 h-3" />
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
