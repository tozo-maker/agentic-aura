import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import AmbientInputBar from "@/components/AmbientInputBar";
import NexusMark from "@/components/NexusMark";

interface HeroSectionProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

const HeroSection = ({ onSubmit, isLoading = false }: HeroSectionProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[min(780px,92vh)] border-b border-border pt-24 pb-8 sm:pt-28 sm:pb-14 overflow-hidden">
      <div className="absolute inset-0 nexus-grid opacity-40" aria-hidden="true" />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
              <div className="flex items-center justify-center gap-3 mb-7">
                <NexusMark className="h-6 w-6" />
                <span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-muted-foreground">Hybrid Intelligence Studio</span>
              </div>
        </motion.div>

        <motion.h1
              className="text-5xl sm:text-7xl md:text-8xl font-serif font-normal leading-[0.9] text-foreground mb-6 sm:mb-7"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
              Make complexity<br /><span className="text-primary italic">operational.</span>
        </motion.h1>

            <motion.p
              className="text-base sm:text-lg font-sans text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              Nexus AI designs agentic systems for commerce, operations, and support—with human judgment at every critical decision.
            </motion.p>
        </div>

        <motion.div
          className="mx-auto mt-8 max-w-3xl sm:mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Start with the Nexus consultant</span>
            <span>Usually responds in seconds</span>
          </div>
          <AmbientInputBar onSubmit={onSubmit} isLoading={isLoading} variant="hero" />
        </motion.div>

        <a href="#services" className="mx-auto mt-7 flex w-fit items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:mt-10">
          Explore how Nexus works
          <ArrowDown className={`h-3.5 w-3.5 ${reduceMotion ? "" : "animate-bounce"}`} />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
