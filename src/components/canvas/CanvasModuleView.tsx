import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import GenUIRenderer from "@/components/genui/GenUIRenderer";
import type { ModuleDeployment } from "@/components/genui/parseModules";

const moduleLabels: Record<string, string> = {
  service_spotlight: "Service Spotlight",
  comparison_table: "Comparison",
  roi_calculator: "ROI Calculator",
  case_study: "Case Study",
  timeline: "Timeline",
  pricing_tier: "Pricing",
  process_flow: "Process",
};

interface CanvasModuleViewProps {
  modules: ModuleDeployment[];
  onRemove: (index: number) => void;
  onAskAbout: (msg: string) => void;
}

const CanvasModuleView = ({ modules, onRemove, onAskAbout }: CanvasModuleViewProps) => {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <AnimatePresence mode="popLayout">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.type}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            {/* Module header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                  {moduleLabels[mod.type] || mod.type}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAskAbout(`Tell me more about this ${moduleLabels[mod.type] || mod.type}`)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Ask about this"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemove(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Close module"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Module content */}
            <div className="p-5">
              <GenUIRenderer deployment={mod} onAction={(msg) => onAskAbout(msg)} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CanvasModuleView;
