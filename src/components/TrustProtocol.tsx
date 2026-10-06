import { ArrowRight, Database, FileCheck2, Network, UserRound, ShieldCheck } from "lucide-react";

const architecture = [
  { icon: Database, title: "Your tools", detail: "CRM, ERP & knowledge" },
  { icon: ShieldCheck, title: "Defined boundaries", detail: "Access & approved rules" },
  { icon: Network, title: "AI prepares", detail: "A proposed next action" },
  { icon: UserRound, title: "People decide", detail: "Review sensitive actions" },
  { icon: FileCheck2, title: "Recorded action", detail: "Execution & audit trail" },
];
const TrustProtocol = () => (
  <section id="how-we-work" className="scroll-mt-20 bg-muted/50 px-5 py-16 sm:px-8 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm font-medium text-muted-foreground">The architecture of trust</p><span className="text-xs text-muted-foreground">Reference design · tailored to each project</span></div>
      <h2 className="mt-8 max-w-3xl text-3xl leading-tight sm:text-5xl">Intelligence is useful.<br />Accountability is essential.</h2>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">Before an agent acts, we define what it can access, what it can change, and when it must ask. Your team’s judgment is part of the design—not an afterthought.</p>
      <figure className="my-12 border-y border-border py-8 sm:my-16 sm:py-10">
        <ol className="grid gap-5 md:grid-cols-5 md:gap-3" aria-label="Human-supervised reference architecture">
          {architecture.map((node, i) => (
            <li key={node.title} className="relative flex items-center gap-4 md:block">
              <node.icon className={`h-6 w-6 shrink-0 ${i === 3 ? "text-accent" : "text-muted-foreground"}`} strokeWidth={1.5} />
              <div><p className="font-medium text-foreground md:mt-5">{node.title}</p><p className="mt-1 text-xs text-muted-foreground">{node.detail}</p></div>
              {i < architecture.length - 1 && <ArrowRight aria-hidden="true" className="absolute right-3 top-1 hidden h-4 w-4 text-muted-foreground/60 md:block" />}
            </li>
          ))}
        </ol>
        <figcaption className="mt-8 max-w-xl text-xs leading-relaxed text-muted-foreground">A proposed pattern, not a live system or client result. Review thresholds, permissions, and logging are defined around your operational risks.</figcaption>
      </figure>
      <div className="grid gap-8 sm:grid-cols-3">
        <div><h3 className="text-lg">Understand first.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Map the work with the people doing it. Agree on the problem before proposing a solution.</p></div>
        <div><h3 className="text-lg">Make the limits explicit.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Decide which actions are reversible, which need approval, and who owns the exceptions.</p></div>
        <div><h3 className="text-lg">Test before expanding.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Start with a bounded workflow. Evaluate it against agreed criteria before widening its scope.</p></div>
      </div>
    </div>
  </section>
);
export default TrustProtocol;
