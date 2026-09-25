import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    className="space-y-4"
  >
    <div className="flex items-center justify-between">
      <h4 className="text-base font-serif font-semibold text-foreground">{data.title}</h4>
      {data.highlight && (
        <span className="text-[10px] font-sans font-medium bg-primary text-primary-foreground px-2 py-1 rounded-sm flex items-center gap-1">
          <Star className="w-3 h-3" /> {data.highlight}
        </span>
      )}
    </div>
    <p className="text-sm font-sans text-muted-foreground leading-relaxed">{data.description}</p>
    <ul className="space-y-1.5">
      {data.features?.map((f, i) => (
        <li key={i} className="text-xs font-sans text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    {data.useCases && data.useCases.length > 0 && (
      <div className="pt-2 border-t border-border">
        <p className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground mb-1">Use Cases</p>
        <div className="flex flex-wrap gap-1">
          {data.useCases.map((uc, i) => (
            <span key={i} className="text-[10px] font-sans border border-border text-foreground px-2 py-1 rounded-sm">{uc}</span>
          ))}
        </div>
      </div>
    )}
    <Button
      onClick={() => onAction?.(`I'd like to scope a ${data.title} project`)}
      className="w-full mt-2"
    >
      Start scoping <ArrowRight className="w-3 h-3" />
    </Button>
  </motion.div>
);

export default ServiceSpotlight;
