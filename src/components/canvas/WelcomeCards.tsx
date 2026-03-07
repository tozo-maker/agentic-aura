import { motion } from "framer-motion";
import { Sparkles, DollarSign, BarChart3, Clock, Layers, Zap } from "lucide-react";

interface WelcomeCardsProps {
  onSend: (message: string) => void;
}

const suggestions = [
  {
    icon: Layers,
    label: "Our Services",
    message: "What services does Nexus AI offer? Show me an overview.",
    color: "text-blue-500",
  },
  {
    icon: DollarSign,
    label: "Pricing",
    message: "Show me your pricing tiers and what's included in each plan.",
    color: "text-emerald-500",
  },
  {
    icon: BarChart3,
    label: "ROI Calculator",
    message: "How much can I save with AI automation? Show me an ROI calculator.",
    color: "text-amber-500",
  },
  {
    icon: Sparkles,
    label: "Case Study",
    message: "Show me a case study of a successful project you've completed.",
    color: "text-purple-500",
  },
  {
    icon: Clock,
    label: "Timeline",
    message: "What does a typical project timeline look like? How long does delivery take?",
    color: "text-rose-500",
  },
  {
    icon: Zap,
    label: "How It Works",
    message: "How does your process work from start to finish?",
    color: "text-cyan-500",
  },
];

const WelcomeCards = ({ onSend }: WelcomeCardsProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
          What can I help you with?
        </h2>
        <p className="text-muted-foreground font-sans text-base max-w-md mx-auto">
          Click a topic below or type your question. I'll respond with interactive visuals.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            onClick={() => onSend(s.message)}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-sans font-medium text-foreground">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeCards;
