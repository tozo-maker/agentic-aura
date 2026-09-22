import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const HeroSection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[72vh] border-b border-border pt-28 pb-28 overflow-hidden">
      <div className="absolute inset-y-0 left-[8%] w-px bg-border/70" aria-hidden="true" />
      <div className="absolute inset-y-0 right-[8%] w-px bg-border/70" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-12 lg:gap-20 items-end">
          <div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
              <div className="flex items-center gap-3 mb-8">
                <span className="h-2 w-2 bg-accent" />
                <span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-primary">Hybrid Intelligence Agency</span>
              </div>
        </motion.div>

        <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-serif font-normal leading-[0.82] text-foreground mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
              Nexus AI
        </motion.h1>

            <motion.p
              className="text-2xl sm:text-3xl md:text-4xl font-serif text-muted-foreground max-w-2xl leading-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              Agentic systems built to act. <span className="italic text-foreground">Human judgment stays in control.</span>
            </motion.p>
          </div>

        <motion.p
            className="text-base md:text-lg text-muted-foreground font-sans max-w-md leading-relaxed border-t border-border pt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
            We design commerce, workflows, support, and infrastructure that think, adapt, and execute—with experts at every critical decision.
        </motion.p>
        </div>

        <motion.div
          className="mt-16 flex items-center gap-3 text-sm font-medium text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <ArrowDownRight className={`w-4 h-4 ${reduceMotion ? "" : "animate-bounce"}`} />
          Start with the AI consultant below
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
