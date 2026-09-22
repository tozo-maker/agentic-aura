import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 200, suffix: "+", label: "Automations Deployed" },
  { value: 98, suffix: "%", label: "Uptime SLA" },
  { value: 40, suffix: "%", label: "Avg Cost Reduction" },
  { value: 12, prefix: "$", suffix: "M+", label: "Revenue Automated" },
];

const clients = [
  "Meridian", "ArcLight", "Vertex", "Polaris", "Helios", "Cascade", "Axiom", "Luminary",
];

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-serif font-normal text-foreground tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

const SocialProof = () => {
  return (
    <section className="py-16 px-6 border-b border-border">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-background text-left p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
               <p className="text-xs font-sans font-medium uppercase tracking-[0.1em] text-muted-foreground mt-3">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-left text-[10px] font-sans text-muted-foreground mt-4 uppercase tracking-wider">
          Target benchmarks based on aggregate project data
        </p>

        {/* Logo Marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex gap-6 animate-marquee">
            {[...clients, ...clients].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex-shrink-0 border border-border bg-card px-6 py-2.5 flex items-center justify-center"
              >
                <span className="text-sm font-sans font-medium text-muted-foreground whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
