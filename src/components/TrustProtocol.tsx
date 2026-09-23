import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  { icon: ShieldCheck, label: "Human-Verified Outputs" },
  { icon: Lock, label: "Encrypted Sessions" },
];

const TrustProtocol = () => {
  const [mode, setMode] = useState<"ai" | "hitl">("hitl");
  const current = modes[mode];

  return (
    <section id="how-we-work" className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-primary-foreground/70">
            How We Work
          </span>
          <h2 className="text-5xl md:text-6xl font-serif font-normal mt-4 text-primary-foreground">
            The Trust Protocol
          </h2>
          <p className="text-primary-foreground/75 font-sans mt-4 max-w-xl mx-auto">
            Every critical action passes through a human verification gate. You choose the speed—we guarantee the quality.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="border border-primary-foreground/25 rounded-md p-1 flex gap-1">
            {(["ai", "hitl"] as const).map((m) => (
              <Button
                key={m}
                onClick={() => setMode(m)}
                variant="ghost"
                className={`relative px-6 py-2.5 text-sm transition-colors ${
                  mode === m ? "text-primary" : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="trust-toggle"
                    className="absolute inset-0 bg-primary-foreground rounded-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {modes[m].label} <span className="text-xs opacity-70">({modes[m].sublabel})</span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Flow */}
        <motion.div
          className="border border-primary-foreground/25 bg-primary-foreground/5 rounded-md p-8 mb-12"
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
                         step.icon === ShieldCheck ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 text-primary-foreground"
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-sans text-primary-foreground/70 max-w-[120px]">{step.text}</p>
                  </div>
                  {i < current.steps.length - 1 && (
                     <div className="hidden md:block w-8 h-px bg-primary-foreground/25" />
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              className="border border-primary-foreground/25 rounded-md px-4 py-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <badge.icon className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-sm font-sans font-medium text-primary-foreground">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustProtocol;
