import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Loader2, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import NexusMark from "@/components/NexusMark";

interface HeroSectionProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

const SCENARIOS = [
  "Automate refund approvals above a set value, with a human sign-off",
  "Triage our support inbox and route sensitive cases to the right person",
  "Find the manual handoffs slowing down our order fulfilment",
  "Draft weekly operations reports from our existing tools",
];

const KEYS = [
  { code: "A1", label: "Map an automation opportunity" },
  { code: "B2", label: "Plan an AI support system" },
  { code: "C3", label: "Review my commerce stack" },
];

const PIPELINE = ["Read order context", "Draft refund action", "Await human approval", "Execute & log"];

function useTypewriter(lines: string[], active: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    let line = 0, i = 0, deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = lines[line];
      i += deleting ? -1 : 1;
      setText(full.slice(0, i));
      let delay = deleting ? 18 : 38;
      if (!deleting && i === full.length) { deleting = true; delay = 3600; }
      else if (deleting && i === 0) { deleting = false; line = (line + 1) % lines.length; delay = 400; }
      t = setTimeout(tick, delay);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [lines, active]);
  return text;
}

function ApprovalDemo() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (step < 2) { const t = setTimeout(() => setStep((s) => s + 1), reduce ? 200 : 1100); return () => clearTimeout(t); }
    if (step === 2 && approved) { const t = setTimeout(() => setStep(3), 700); return () => clearTimeout(t); }
    if (step === 3) { const t = setTimeout(() => { setStep(0); setApproved(false); }, 3200); return () => clearTimeout(t); }
  }, [step, approved, reduce]);

  const waiting = step === 2 && !approved;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Unit 02 · Human gate</span>
        <span className="flex items-center gap-2">
          <span className={`led ${waiting ? "led-pulse" : step === 3 ? "" : "led-off"}`} />
          {waiting ? "Awaiting you" : step === 3 ? "Complete" : "Running"}
        </span>
      </div>
      <div className="inset-well flex-1 p-4">
        <ol className="space-y-2.5">
          {PIPELINE.map((label, i) => {
            const done = i < step || (i === 3 && step === 3);
            const current = i === step && step !== 3;
            return (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] transition-colors ${done ? "border-foreground bg-foreground text-background" : current ? "border-accent text-accent" : "border-border text-muted-foreground"}`}>
                  {done ? <Check className="h-3 w-3" /> : current && i !== 2 ? <Loader2 className="h-3 w-3 animate-spin" /> : `0${i + 1}`}
                </span>
                <span className={done || current ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0 font-mono text-[11px] text-muted-foreground">
            <span className="text-foreground">REFUND</span> · order #4821 · €640
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={approved}
            aria-label="Approve the refund"
            disabled={!waiting}
            onClick={() => setApproved(true)}
            className={`relative h-7 w-14 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed ${approved || step === 3 ? "border-accent bg-accent" : "border-border bg-secondary"} ${waiting ? "ring-4 ring-accent/25" : ""}`}
          >
            <motion.span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-md"
              animate={{ left: approved || step === 3 ? 30 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>
      <p className="px-1 pt-3 text-[11px] text-muted-foreground">
        {waiting ? "Flip the switch — nothing executes until a person approves." : "A sample of the approval step built into every Nexus system."}
      </p>
    </div>
  );
}

const HeroSection = ({ onSubmit, isLoading = false }: HeroSectionProps) => {
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const typed = useTypewriter(SCENARIOS, !reduce && !value && !focused);
  const placeholder = reduce || focused ? "What are you looking to build?" : typed;

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    onSubmit(t);
    setValue("");
  };

  return (
    <section className="relative overflow-hidden border-b border-border pt-28 pb-14 sm:pt-32 sm:pb-16">
      <div className="absolute inset-0 glow-pool" aria-hidden="true" />
      <div className="absolute inset-0 dot-field" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.6fr] lg:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 hw-label"
            >
              <span className="led" /> Hybrid intelligence studio
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}
              className="text-5xl font-semibold leading-[0.95] text-foreground sm:text-6xl lg:text-[4.25rem]"
            >
              AI systems that act.<br />
              <span className="text-muted-foreground">People stay in charge.</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }}
            className="max-w-sm text-base leading-relaxed text-muted-foreground lg:justify-self-end lg:pb-2"
          >
            Nexus designs agentic systems for commerce, operations, and support — with a human decision at every step that matters.
          </motion.p>
        </div>

        {/* Command cockpit: prompt deck and live runner in one enclosure */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.24 }}
          className="chassis mt-10 p-2.5 sm:p-3"
        >
          <div className="flex items-center justify-between border-b border-border px-2 pb-2.5 pt-0.5">
            <span className="hw-label flex items-center gap-2"><NexusMark className="h-3.5 w-3.5" /> Nexus console</span>
            <span className="hw-label flex items-center gap-2">
              <span className={`led ${isLoading ? "led-pulse" : ""}`} />{isLoading ? "Connecting" : "Ready"}
            </span>
          </div>

          <div className="grid gap-3 pt-3 lg:grid-cols-[1.25fr_1px_0.9fr] lg:gap-4">
            <form onSubmit={(e) => { e.preventDefault(); submit(value); }} className="flex flex-col">
              <label htmlFor="hero-prompt" className="hw-label px-1 pb-3">01 · Describe the work</label>
              <div className="inset-well flex flex-1 items-end gap-2 p-3">
                <textarea
                  id="hero-prompt"
                  ref={ref}
                  rows={3}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(value); } }}
                  placeholder={placeholder}
                  className="min-h-[5rem] flex-1 resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button type="button" aria-label="Voice input — coming soon" title="Voice input — coming soon" disabled className="tactile-key flex h-10 w-10 items-center justify-center text-muted-foreground opacity-50">
                  <Mic className="h-4 w-4" />
                </button>
                <button type="submit" aria-label="Start consultation" disabled={!value.trim() || isLoading} className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-accent text-accent-foreground shadow-[0_2px_0_hsl(var(--accent)/0.5)] transition active:translate-y-0.5 disabled:opacity-40">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </button>
              </div>
              <p className="hw-label px-1 pb-2 pt-4">Or start from a preset</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {KEYS.map((k) => (
                  <button
                    key={k.code}
                    type="button"
                    data-pressed={pressed === k.code}
                    onClick={() => { setPressed(k.code); setTimeout(() => submit(k.label), 140); }}
                    className="tactile-key flex items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-foreground"
                  >
                    <span className="font-mono text-[10px] text-accent">{k.code}</span>{k.label}
                  </button>
                ))}
              </div>
              <p className="px-1 pt-3 text-[10px] text-muted-foreground">
                Private, no commitment. By chatting, you agree to our <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </form>

            <div className="bus-line hidden lg:block" aria-hidden="true" />

            <div>
              <p className="hw-label px-1 pb-0">02 · Watch it run</p>
              <div className="pt-3"><ApprovalDemo /></div>
            </div>
          </div>
        </motion.div>
      </div>

      <a href="#services" className="relative mx-auto mt-10 flex w-fit items-center gap-2 hw-label hover:text-foreground">
        Explore systems <ArrowDown className={`h-3.5 w-3.5 ${reduce ? "" : "animate-bounce"}`} />
      </a>
    </section>
  );
};

export default HeroSection;
