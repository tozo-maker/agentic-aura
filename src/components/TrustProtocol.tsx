import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Play, ShieldCheck, Zap, UserCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const REQUEST = "Customer asks to cancel and refund an annual plan";

const LANES = {
  auto: {
    title: "Autonomous",
    icon: Zap,
    note: "Best for routine, reversible work.",
    steps: ["Read request", "Check policy", "Issue refund", "Notify customer"],
    gate: -1,
  },
  gated: {
    title: "Human-gated",
    icon: ShieldCheck,
    note: "Best for money, data, or anything hard to undo.",
    steps: ["Read request", "Check policy", "Reviewer approves", "Issue refund & notify"],
    gate: 2,
  },
} as const;

type LaneKey = keyof typeof LANES;

function Lane({ k, tick, approved, onApprove }: { k: LaneKey; tick: number; approved: boolean; onApprove: () => void }) {
  const lane = LANES[k];
  const gated = lane.gate >= 0;
  // A gated lane cannot advance past its gate until approved.
  const pos = gated && !approved ? Math.min(tick, lane.gate) : tick;
  const waiting = gated && !approved && tick >= lane.gate && tick > 0;
  const done = pos >= lane.steps.length;

  return (
    <div className="inset-well flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-base font-semibold text-foreground"><lane.icon className="h-4 w-4 text-accent" />{lane.title}</span>
        <span className="hw-label flex items-center gap-2">
          <span className={`led ${waiting ? "led-pulse" : tick === 0 ? "led-off" : ""}`} />
          {done ? "Done" : waiting ? "Waiting" : tick === 0 ? "Idle" : "Running"}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{lane.note}</p>
      <ol className="mt-5 space-y-2.5">
        {lane.steps.map((s, i) => {
          const isDone = i < pos;
          const current = i === pos && tick > 0 && !done;
          const isGate = i === lane.gate;
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] transition-colors ${isDone ? "border-foreground bg-foreground text-background" : current ? "border-accent text-accent" : "border-border text-muted-foreground"}`}>
                {isDone ? <Check className="h-3 w-3" /> : isGate ? <UserCheck className="h-3 w-3" /> : current ? <Loader2 className="h-3 w-3 animate-spin" /> : `0${i + 1}`}
              </span>
              <span className={isDone || current ? "text-foreground" : "text-muted-foreground"}>{s}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto pt-5">
        {waiting ? (
          <Button size="sm" onClick={onApprove} className="bg-accent text-accent-foreground hover:bg-accent/90"><UserCheck className="h-4 w-4" /> Approve refund</Button>
        ) : (
          <p className="font-mono text-[11px] text-muted-foreground">
            {done ? (gated ? "Executed after a recorded sign-off." : "Executed without review.") : gated ? "Stops for a reviewer before money moves." : "Runs end to end."}
          </p>
        )}
      </div>
    </div>
  );
}

const TrustProtocol = () => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [approved, setApproved] = useState(false);
  const max = 4;

  useEffect(() => {
    if (tick === 0 || tick >= max) return;
    const t = setTimeout(() => setTick((n) => n + 1), reduce ? 150 : 850);
    return () => clearTimeout(t);
  }, [tick, reduce]);

  const run = () => { setApproved(false); setTick(1); };

  return (
    <section id="how-we-work" className="relative border-b border-border px-5 py-20 sm:py-28">
      <div className="absolute inset-0 glow-pool opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-10 grid gap-6 md:grid-cols-[1fr_.7fr] md:items-end"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <div>
            <span className="hw-label text-accent">How we work</span>
            <h2 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">Automation where it helps. Judgment where it matters.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:justify-self-end">
            Send the same request through both policies and compare. You decide, per action, which work runs on its own and which waits for a person.
          </p>
        </motion.div>

        <div className="chassis p-2.5 sm:p-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-2 pb-3 pt-1">
            <div className="min-w-0">
              <p className="hw-label">Incoming request</p>
              <p className="mt-1 text-sm font-medium text-foreground">{REQUEST}</p>
            </div>
            <Button variant="outline" size="sm" onClick={run} disabled={tick > 0 && tick < max}>
              {tick >= max ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />} {tick >= max ? "Run again" : "Run both"}
            </Button>
          </div>
          <div className="grid gap-3 pt-3 md:grid-cols-2">
            <Lane k="auto" tick={tick} approved={approved} onApprove={() => setApproved(true)} />
            <Lane k="gated" tick={tick} approved={approved} onApprove={() => setApproved(true)} />
          </div>
          <p className="px-2 pt-3 text-[11px] text-muted-foreground">Illustrative simulation — not live data.</p>
        </div>
      </div>
    </section>
  );
};

export default TrustProtocol;
