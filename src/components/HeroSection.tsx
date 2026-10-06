import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import sculpture from "@/assets/editorial-sculpture.jpg";

interface HeroSectionProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

const HeroSection = ({ onSubmit, isLoading = false }: HeroSectionProps) => {
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submit = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onSubmit(text);
  };

  return (
    <section id="consultation" className="editorial-hero relative isolate overflow-hidden border-b border-border">
      <img src={sculpture} alt="" width={1920} height={1280} className="editorial-hero-image absolute inset-0 -z-10 h-full w-full object-cover" fetchPriority="high" />
      <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-24 sm:px-8 sm:pb-16 sm:pt-36">
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-[620px]">
          <p className="mb-7 text-sm font-medium text-hero-muted">Independent AI design & engineering</p>
          <h1 className="text-5xl font-semibold leading-[1.02] text-hero-foreground sm:text-6xl lg:text-[72px]">Nexus AI<span className="text-accent">.</span></h1>
          <p className="mt-5 max-w-[520px] font-display text-3xl font-medium leading-[1.15] text-hero-foreground sm:text-4xl">Less busywork.<br />More human judgment.</p>
          <p className="mt-6 max-w-[440px] text-base leading-relaxed text-hero-muted">We design AI systems around the way your business works. Connected to your tools. Clear about their limits. Accountable to your people.</p>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-9 max-w-[480px]">
            <label htmlFor="hero-prompt" className="mb-3 block text-sm font-medium text-hero-foreground">What’s getting in the way of your work?</label>
            <div className="editorial-entry flex items-end gap-3 border border-hero-border bg-hero-surface p-4 focus-within:ring-2 focus-within:ring-ring">
              <textarea id="hero-prompt" ref={inputRef} rows={2} value={value} disabled={isLoading} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} placeholder="Our team spends hours moving data between tools…" className="min-h-[56px] min-w-0 flex-1 resize-none bg-transparent text-base leading-relaxed text-hero-foreground outline-none placeholder:text-hero-muted" />
              <Button type="submit" size="icon" aria-label="Start consultation" disabled={!value.trim() || isLoading} className="shrink-0 bg-hero-foreground text-hero-surface hover:bg-hero-foreground/80">{isLoading ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-hero-muted">
              <span>Explore with our AI consultant</span>
              <Link to="/privacy" className="underline underline-offset-4">Privacy & data</Link>
            </div>
            <Button type="button" variant="link" className="mt-4 h-auto whitespace-normal p-0 text-sm text-hero-foreground" onClick={() => { setValue("Help me identify where AI could genuinely help our business."); inputRef.current?.focus(); }}>Not sure where to start? <ArrowRight /></Button>
          </form>
        </motion.div>
        <div className="mt-8 flex items-center justify-between border-t border-hero-border pt-5 text-xs text-hero-muted sm:mt-14">
          <span>Commerce · Operations · Customer experience</span>
          <a href="#services" className="hidden items-center gap-2 text-hero-foreground sm:flex">Our approach <ArrowRight className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
