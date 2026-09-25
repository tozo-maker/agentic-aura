import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { TrendingUp } from "lucide-react";

interface ROICalculatorData {
  title: string;
  baselineCostPerUnit: number;
  automatedCostPerUnit: number;
  unitLabel: string;
  defaultVolume: number;
  maxVolume: number;
  currency?: string;
}

const ROICalculator = ({ data }: { data: ROICalculatorData }) => {
  const [volume, setVolume] = useState(data.defaultVolume || 500);
  const currency = data.currency || "$";
  const currentCost = volume * data.baselineCostPerUnit;
  const newCost = volume * data.automatedCostPerUnit;
  const savings = currentCost - newCost;
  const pct = currentCost > 0 ? Math.round((savings / currentCost) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-foreground" />
        <h4 className="text-sm font-serif font-semibold text-foreground">{data.title}</h4>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-sans">
          <span className="text-muted-foreground">Monthly {data.unitLabel}</span>
          <span className="text-foreground font-medium">{volume.toLocaleString()}</span>
        </div>
        <Slider
          value={[volume]}
          onValueChange={([v]) => setVolume(v)}
          min={10}
          max={data.maxVolume}
          step={10}
          className="py-1"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-md p-3 text-center">
          <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wide">Current</p>
          <p className="text-sm font-sans font-semibold text-foreground mt-1">{currency}{currentCost.toLocaleString()}</p>
        </div>
        <div className="bg-secondary rounded-md p-3 text-center">
          <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wide">Automated</p>
          <p className="text-sm font-sans font-semibold text-foreground mt-1">{currency}{newCost.toLocaleString()}</p>
        </div>
        <div className="bg-primary rounded-md p-3 text-center">
          <p className="text-[10px] font-sans text-primary-foreground uppercase tracking-wide">Savings</p>
          <p className="text-sm font-sans font-semibold text-primary-foreground mt-1">{pct}%</p>
        </div>
      </div>

      <p className="text-xs font-sans text-muted-foreground text-center">
        Estimated annual savings: <span className="font-semibold text-foreground">{currency}{(savings * 12).toLocaleString()}</span>
      </p>
    </motion.div>
  );
};

export default ROICalculator;
