import { motion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import GenUIRenderer from "@/components/genui/GenUIRenderer";
import ModuleErrorBoundary from "@/components/genui/ModuleErrorBoundary";
import type { ModuleDeployment } from "@/components/genui/parseModules";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <motion.span
            className="w-2 h-2 bg-primary"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {showChat && (
            <Button
              onClick={() => onSendMessage(`Tell me more about this ${label}`)}
              variant="ghost" size="icon-sm"
              aria-label={`Ask about ${label}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            onClick={onRemove}
            variant="ghost" size="icon-sm"
            aria-label={`Close ${label}`}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
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
