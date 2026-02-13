import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

interface ServiceSpotlightData {
  serviceId: string;
  title: string;
  description: string;
  features: string[];
  highlight?: string;
  useCases?: string[];
}

const ServiceSpotlight = ({ data, onAction }: { data: ServiceSpotlightData; onAction?: (msg: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="glass rounded-2xl p-5 space-y-3"
  >
    <div className="flex items-center justify-between">
      <h4 className="text-base font-serif font-semibold text-foreground">{data.title}</h4>
      {data.highlight && (
        <span className="text-[10px] font-sans font-medium bg-foreground text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" /> {data.highlight}
        </span>
      )}
    </div>
    <p className="text-sm font-sans text-muted-foreground leading-relaxed">{data.description}</p>
    <ul className="space-y-1.5">
      {data.features?.map((f, i) => (
        <li key={i} className="text-xs font-sans text-foreground flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-foreground shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    {data.useCases && data.useCases.length > 0 && (
      <div className="pt-2 border-t border-border">
        <p className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground mb-1">Use Cases</p>
        <div className="flex flex-wrap gap-1">
          {data.useCases.map((uc, i) => (
            <span key={i} className="text-[10px] font-sans bg-secondary text-foreground px-2 py-0.5 rounded-full">{uc}</span>
          ))}
        </div>
      </div>
    )}
    <button
      onClick={() => onAction?.(`I'd like to scope a ${data.title} project`)}
      className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-sans font-medium bg-foreground text-primary-foreground py-2 rounded-xl hover:opacity-90 transition-opacity"
    >
      Start scoping <ArrowRight className="w-3 h-3" />
    </button>
  </motion.div>
);

export default ServiceSpotlight;
