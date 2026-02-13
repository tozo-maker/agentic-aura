import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface ProcessFlowData {
  title: string;
  steps: { name: string; description: string }[];
}

const ProcessFlow = ({ data }: { data: ProcessFlowData }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="glass rounded-2xl p-5 space-y-2"
  >
    <h4 className="text-sm font-serif font-semibold text-foreground mb-3">{data.title}</h4>
    {data.steps.map((step, i) => (
      <div key={i}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-3"
        >
          <div className="w-6 h-6 rounded-full bg-foreground text-primary-foreground flex items-center justify-center text-[10px] font-sans font-semibold shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <p className="text-xs font-sans font-medium text-foreground">{step.name}</p>
            <p className="text-[10px] font-sans text-muted-foreground">{step.description}</p>
          </div>
        </motion.div>
        {i < data.steps.length - 1 && (
          <div className="flex justify-start ml-2.5 py-1">
            <ArrowDown className="w-3 h-3 text-muted-foreground/50" />
          </div>
        )}
      </div>
    ))}
  </motion.div>
);

export default ProcessFlow;
