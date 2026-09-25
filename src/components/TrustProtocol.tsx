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
    <section id="how-we-work" className="py-20 sm:py-28 px-5 bg-secondary/35 border-b border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid gap-6 md:grid-cols-[1fr_.7fr] md:items-end mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div><span className="text-xs font-sans font-semibold tracking-[0.16em] uppercase text-accent">
            How We Work
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal mt-4 text-foreground">
            Automation where it helps. Judgment where it matters.
          </h2></div>
          <p className="text-muted-foreground font-sans max-w-md md:justify-self-end text-sm leading-relaxed">
            Choose autonomous handling for routine work or add a human approval gate before sensitive actions move forward.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex mb-6">
          <div className="border border-border bg-background rounded-md p-1 flex gap-1">
            {(["ai", "hitl"] as const).map((m) => (
              <Button
                key={m}
                onClick={() => setMode(m)}
                variant="ghost"
                className={`relative px-6 py-2.5 text-sm transition-colors ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="trust-toggle"
                    className="absolute inset-0 bg-primary rounded-sm"
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
          className="border border-border bg-background rounded-md p-6 sm:p-10 mb-8"
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
                      className={`w-11 h-11 rounded-md border flex items-center justify-center ${
                         step.icon === ShieldCheck ? "border-accent bg-accent text-accent-foreground" : "border-border bg-secondary text-foreground"
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
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              className="border border-border bg-background rounded-md px-4 py-2 flex items-center gap-2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <badge.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-sans font-medium text-foreground">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustProtocol;
