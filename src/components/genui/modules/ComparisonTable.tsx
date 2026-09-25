import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface ComparisonTableData {
  title: string;
  columns: { name: string; recommended?: boolean }[];
  rows: { feature: string; values: (boolean | string)[] }[];
}

const ComparisonTable = ({ data }: { data: ComparisonTableData }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="overflow-x-auto"
  >
    <h4 className="text-sm font-serif font-semibold text-foreground mb-3">{data.title}</h4>
    <table className="w-full text-xs font-sans">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left py-2 text-muted-foreground font-medium pr-3">Feature</th>
          {data.columns.map((col, i) => (
            <th key={i} className="text-center py-2 px-2 font-medium text-foreground">
              <div className="flex flex-col items-center gap-0.5">
                {col.name}
                {col.recommended && (
                  <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">Best</span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, i) => (
          <tr key={i} className="border-b border-border last:border-0">
            <td className="py-2 pr-3 text-muted-foreground">{row.feature}</td>
            {row.values.map((val, j) => (
              <td key={j} className="py-2 px-2 text-center">
                {typeof val === "boolean" ? (
                  val ? <Check className="w-3.5 h-3.5 text-foreground mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />
                ) : (
                  <span className="text-foreground">{val}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);

export default ComparisonTable;
