import { ArrowUpRight } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";

const areas = [
  { id: "automation", title: "Give your team their time back.", problem: "The same information. Entered again. Checked again. Passed on again.", description: "Connect the tools you already use and automate repeatable handoffs. Keep exceptions with the people who understand them.", scope: "Workflow automation · Data intelligence", prompt: "Help me map the repetitive handoffs in our operations and decide which are worth automating." },
  { id: "ai_support", title: "Make support feel more human.", problem: "Routine questions fill the queue. The difficult ones need attention.", description: "Ground answers in your approved knowledge, give your team the right context, and route sensitive requests to a person rather than guessing.", scope: "Customer support · Knowledge systems", prompt: "Help me design a support system that handles routine questions and escalates sensitive requests to our team." },
  { id: "commerce", title: "Connect the customer journey.", problem: "Your storefront, inventory, and internal tools tell different stories.", description: "Build connected commerce experiences and interfaces that respond to customer intent, supported by infrastructure designed for reliability.", scope: "Commerce · Adaptive interfaces · Infrastructure", prompt: "Help me connect our commerce experience with our inventory and operational tools." },
];
interface BentoGridProps { activeService?: string | null; onOpenChat?: (intent: string, serviceId?: string) => void; }
const BentoGrid = forwardRef<HTMLElement, BentoGridProps>(({ onOpenChat }, ref) => (
  <section ref={ref} id="services" className="scroll-mt-20 border-b border-border px-5 py-16 sm:px-8 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-7 md:grid-cols-[.7fr_1.3fr]">
        <p className="text-sm font-medium text-muted-foreground">The work worth doing</p>
        <div><h2 className="max-w-2xl text-3xl leading-tight sm:text-5xl">Start with the friction.<br /><span className="text-muted-foreground">Not the technology.</span></h2><p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">You don’t need another AI experiment. You need a clear answer to where it helps, where it doesn’t, and what changes for your team.</p></div>
      </div>
      <div className="mt-12 sm:mt-16">
        {areas.map((area, i) => (
          <article key={area.id} className="grid gap-5 border-t border-border py-8 md:grid-cols-[.7fr_1.3fr] sm:py-10">
            <div className="flex items-start gap-5"><span className="pt-1 text-xs text-muted-foreground">0{i + 1}</span><h3 className="max-w-[260px] text-xl leading-snug sm:text-2xl">{area.title}</h3></div>
            <div className="grid gap-5 sm:grid-cols-[1fr_auto]"><div><p className="max-w-lg text-base text-foreground">{area.problem}</p><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{area.description}</p><p className="mt-5 text-xs text-muted-foreground">{area.scope}</p></div><Button variant="ghost" size="icon" aria-label={`Discuss: ${area.title}`} title={`Discuss: ${area.title}`} onClick={() => onOpenChat?.(area.prompt)} className="rounded-full border border-border"><ArrowUpRight /></Button></div>
          </article>
        ))}
      </div>
    </div>
  </section>
));
BentoGrid.displayName = "BentoGrid";
export default BentoGrid;
