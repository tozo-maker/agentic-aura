import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, Eye, Lock, Accessibility } from "lucide-react";

const modes = {
  ai: {
    label: "AI Mode",
    sublabel: "Fast",
    steps: [
      { icon: Zap, text: "User request received" },
      { icon: Zap, text: "AI processes and responds instantly" },
      { icon: Zap, text: "Action executed automatically" },
    ],
  },
  hitl: {
    label: "HITL Mode",
    sublabel: "Verified",
    steps: [
      { icon: Zap, text: "User request received" },
      { icon: Eye, text: "AI drafts response" },
      { icon: ShieldCheck, text: "Human expert reviews & approves" },
      { icon: ShieldCheck, text: "Verified action executed" },
    ],
  },
};

const badges = [
  { icon: ShieldCheck, label: "Human Verified" },
  { icon: Lock, label: "Zero Retention" },
  { icon: Accessibility, label: "WCAG 2.2 AA" },
];

const TrustProtocol = () => {
  const [mode, setMode] = useState<"ai" | "hitl">("hitl");
  const current = modes[mode];

  return (
    <section className="py-24 px-6 noise-overlay">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground">
            How We Work
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mt-4 text-foreground">
            The Trust Protocol
          </h2>
          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto">
            Every critical action passes through a human verification gate. You choose the speed—we guarantee the quality.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="glass rounded-full p-1 flex gap-1">
            {(["ai", "hitl"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-sans font-medium transition-colors ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="trust-toggle"
                    className="absolute inset-0 bg-foreground rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {modes[m].label} <span className="text-xs opacity-70">({modes[m].sublabel})</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Flow */}
        <motion.div
          className="glass rounded-2xl p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row items-center gap-4"
            >
              {current.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        step.icon === ShieldCheck ? "bg-green-100 text-green-700" : "bg-secondary text-foreground"
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-sans text-muted-foreground max-w-[120px]">{step.text}</p>
                  </div>
                  {i < current.steps.length - 1 && (
                    <div className="hidden md:block w-8 h-px bg-border" />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="glass rounded-full px-4 py-2 flex items-center gap-2"
            >
              <badge.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-sans font-medium text-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustProtocol;
