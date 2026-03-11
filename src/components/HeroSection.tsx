import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center noise-overlay overflow-hidden pt-20">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(35 40% 85%), transparent)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(25 30% 80%), transparent)" }}
        animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block mb-6 px-4 py-1.5 text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground glass rounded-full">
            Hybrid Intelligence Agency
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-semibold leading-[0.95] tracking-tight text-foreground mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          Where Automation
          <br />
          <span className="italic font-normal">Meets Intention</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground font-sans max-w-2xl mx-auto mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          We build agentic systems that think, adapt, and act—with a human always in the loop.
          Commerce, workflows, and infrastructure that run themselves.
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground/60 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Start typing below to talk to our AI ↓
        </motion.p>
      </div>
    </section>
  );
};

export default HeroSection;
