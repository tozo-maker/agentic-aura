import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Loader2, Play, RotateCcw, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmulatedSystem {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  steps: string[];
  /** Illustrative log line per step; a simulation, not real output. */
  logs: string[];
}

interface Props {
  system: EmulatedSystem;
  onConsult: () => void;
}

/** Simulated run of an agent workflow. The last step always waits for a person. */
const SystemEmulator = ({ system, onConsult }: Props) => {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(-1); // -1 idle
  const [approved, setApproved] = useState(false);
  const gate = system.steps.length - 1;
  const done = approved && step > gate;

  useEffect(() => { setStep(-1); setApproved(false); }, [system.id]);

  useEffect(() => {
    if (step < 0) return;
    if (step < gate) { const t = setTimeout(() => setStep((s) => s + 1), reduce ? 150 : 900); return () => clearTimeout(t); }
    if (step === gate && approved) { const t = setTimeout(() => setStep(gate + 1), 500); return () => clearTimeout(t); }
  }, [step, approved, gate, reduce]);

  const running = step >= 0 && step < gate;
  const waiting = step === gate && !approved;
  const status = done ? "Complete" : waiting ? "Awaiting approval" : running ? "Running" : "Idle";

  return (
    <motion.div key={system.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="inset-well flex flex-col p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="hw-label flex items-center gap-2 text-accent"><system.icon className="h-3.5 w-3.5" /> Simulation</span>
        <span className="hw-label flex items-center gap-2">
          <span className={`led ${waiting ? "led-pulse" : step < 0 ? "led-off" : ""}`} />{status}
        </span>
      </div>
      <h3 className="mt-4 text-3xl font-semibold text-foreground">{system.title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{system.description}</p>

      <ol className="mt-6 space-y-2">
        {system.steps.map((label, i) => {
          const isDone = i < step || (i === gate && approved);
          const isCurrent = i === step && !isDone;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] transition-colors ${isDone ? "border-foreground bg-foreground text-background" : isCurrent ? "border-accent text-accent" : "border-border text-muted-foreground"}`}>
                {isDone ? <Check className="h-3 w-3" /> : isCurrent && i !== gate ? <Loader2 className="h-3 w-3 animate-spin" /> : i === gate ? <UserCheck className="h-3 w-3" /> : `0${i + 1}`}
              </span>
              <span className={isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="log-screen mt-5 min-h-[7.5rem] p-3 font-mono text-[11px] leading-relaxed" aria-live="polite">
        {step < 0 && <p className="text-muted-foreground">› Press run to simulate this system.</p>}
        <AnimatePresence initial={false}>
          {system.logs.slice(0, Math.max(0, Math.min(step + 1, system.logs.length))).map((line, i) => (
            <motion.p key={line} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={i === gate ? "text-accent" : "text-muted-foreground"}>
              <span className="text-foreground">›</span> {line}
            </motion.p>
          ))}
        </AnimatePresence>
        {done && <p className="text-foreground">› Approved by reviewer. Action executed and logged.</p>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {waiting ? (
          <Button onClick={() => setApproved(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <UserCheck className="h-4 w-4" /> Approve as reviewer
          </Button>
        ) : (
          <Button variant="outline" onClick={() => { setApproved(false); setStep(0); }} disabled={running}>
            {done ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />} {done ? "Run again" : "Run simulation"}
          </Button>
        )}
        <Button onClick={onConsult}>Plan this for my business</Button>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Illustrative simulation — not live data.</p>
    </motion.div>
  );
};

export default SystemEmulator;
