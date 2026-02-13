import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PricingTierData {
  title: string;
  tiers: {
    name: string;
    price: string;
    period: string;
    features: string[];
    recommended?: boolean;
  }[];
}

const PricingTier = ({ data, onAction }: { data: PricingTierData; onAction?: (msg: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="glass rounded-2xl p-4 space-y-3"
  >
    <h4 className="text-sm font-serif font-semibold text-foreground">{data.title}</h4>
    <div className="grid grid-cols-1 gap-2">
      {data.tiers.map((tier, i) => (
        <div
          key={i}
          className={`rounded-xl p-3 border ${
            tier.recommended
              ? "bg-foreground text-primary-foreground border-foreground"
              : "bg-secondary border-border"
          }`}
        >
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-xs font-sans font-medium ${tier.recommended ? "text-primary-foreground" : "text-foreground"}`}>
              {tier.name}
            </span>
            <div className="text-right">
              <span className={`text-lg font-serif font-semibold ${tier.recommended ? "text-primary-foreground" : "text-foreground"}`}>
                {tier.price}
              </span>
              <span className={`text-[10px] font-sans ${tier.recommended ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                /{tier.period}
              </span>
            </div>
          </div>
          <ul className="space-y-1">
            {tier.features.map((f, j) => (
              <li key={j} className={`text-[10px] font-sans flex items-center gap-1.5 ${tier.recommended ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                <Check className="w-3 h-3 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          {tier.recommended && (
            <button
              onClick={() => onAction?.(`Tell me more about the ${tier.name} plan`)}
              className="w-full mt-2 text-[10px] font-sans font-medium bg-primary-foreground text-foreground py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Learn more
            </button>
          )}
        </div>
      ))}
    </div>
  </motion.div>
);

export default PricingTier;
