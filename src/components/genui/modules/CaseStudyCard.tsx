import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface CaseStudyData {
  title: string;
  client: string;
  industry: string;
  challenge: string;
  result: string;
  metrics: { label: string; value: string }[];
}

const CaseStudyCard = ({ data }: { data: CaseStudyData }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="glass rounded-2xl p-5 space-y-3"
  >
    <div className="flex items-center gap-2">
      <Award className="w-4 h-4 text-foreground" />
      <h4 className="text-sm font-serif font-semibold text-foreground">{data.title}</h4>
    </div>
    <div className="flex gap-2">
      <span className="text-[10px] font-sans bg-secondary text-foreground px-2 py-0.5 rounded-full">{data.client}</span>
      <span className="text-[10px] font-sans bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{data.industry}</span>
    </div>
    <div className="space-y-1.5 text-xs font-sans">
      <p className="text-muted-foreground"><span className="font-medium text-foreground">Challenge:</span> {data.challenge}</p>
      <p className="text-muted-foreground"><span className="font-medium text-foreground">Result:</span> {data.result}</p>
    </div>
    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
      {data.metrics.map((m, i) => (
        <div key={i} className="text-center">
          <p className="text-base font-serif font-semibold text-foreground">{m.value}</p>
          <p className="text-[10px] font-sans text-muted-foreground">{m.label}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

export default CaseStudyCard;
