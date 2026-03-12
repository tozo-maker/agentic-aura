import { motion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import GenUIRenderer from "@/components/genui/GenUIRenderer";
import ModuleErrorBoundary from "@/components/genui/ModuleErrorBoundary";
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

interface InlineModuleCardProps {
  mod: ModuleDeployment;
  onRemove: () => void;
  onSendMessage: (text: string) => void;
  showChat?: boolean;
}

const InlineModuleCard = ({ mod, onRemove, onSendMessage, showChat = true }: InlineModuleCardProps) => {
  const label = moduleLabels[mod.type] || mod.type;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <motion.span
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {showChat && (
            <button
              onClick={() => onSendMessage(`Tell me more about this ${label}`)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-5">
        <ModuleErrorBoundary>
          <GenUIRenderer deployment={mod} onAction={(msg) => onSendMessage(msg)} />
        </ModuleErrorBoundary>
      </div>
    </div>
  );
};

export default InlineModuleCard;
