import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimelineData {
  title: string;
  totalWeeks: number;
  phases: { name: string; weeks: number; description: string }[];
}

const TimelineVisualizer = ({ data }: { data: TimelineData }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="space-y-4"
  >
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-foreground" />
      <h4 className="text-sm font-serif font-semibold text-foreground">{data.title}</h4>
      <span className="ml-auto text-[10px] font-sans text-muted-foreground">{data.totalWeeks} weeks total</span>
    </div>
    <div className="space-y-2.5">
      {data.phases.map((phase, i) => {
        const widthPct = Math.max(20, (phase.weeks / data.totalWeeks) * 100);
        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-sans font-medium text-foreground">{phase.name}</span>
              <span className="text-[10px] font-sans text-muted-foreground">{phase.weeks}w</span>
            </div>
            <div className="w-full bg-secondary rounded-sm h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] font-sans text-muted-foreground">{phase.description}</p>
          </div>
        );
      })}
    </div>
  </motion.div>
);

export default TimelineVisualizer;
