import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "We automated our entire procurement pipeline. What used to take 3 days now happens in 20 minutes.",
    name: "Logistics COO",
    role: "Enterprise Supply Chain",
    metric: "92% faster",
  },
  {
    quote: "The AI support agent handles 80% of our tickets autonomously. Our CSAT score has never been higher.",
    name: "SaaS VP Support",
    role: "B2B Software Platform",
    metric: "60% cost cut",
  },
  {
    quote: "Self-healing infrastructure saved us during peak traffic. Zero downtime, zero stress.",
    name: "E-Commerce CTO",
    role: "DTC Retail Brand",
    metric: "99.99% uptime",
  },
];

const Testimonials = () => {
  return (
    <section id="results" className="py-24 px-6 noise-overlay">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground">
            Results
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mt-4 text-foreground">
            What Results Look Like
          </h2>
          <p className="text-xs font-sans text-muted-foreground mt-3">
            Representative scenarios based on typical client outcomes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-sans text-foreground leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-sans font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs font-sans text-muted-foreground">{t.role}</p>
                </div>
                <span className="text-xs font-sans font-semibold bg-foreground text-primary-foreground px-3 py-1 rounded-full">
                  {t.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
