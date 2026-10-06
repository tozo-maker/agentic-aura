import { motion } from "framer-motion";
import { History, ArrowLeft, MessageSquare, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NexusMark from "@/components/NexusMark";

interface SessionDockProps {
  title: string;
  isLoading: boolean;
  overviewOpen: boolean;
  onToggleOverview: () => void;
  onOpenHistory: () => void;
  onNew: () => void;
  onEnd: () => void;
}

const SessionDock = ({ title, isLoading, overviewOpen, onToggleOverview, onOpenHistory, onNew, onEnd }: SessionDockProps) => (
  <motion.div
    layoutId="nexus-stage-head"
    className="glass-dock sticky top-0 z-40"
    transition={{ type: "spring", stiffness: 260, damping: 32 }}
  >
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <NexusMark className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Nexus consultant is composing…" : "AI consultation · saved"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onToggleOverview} className="gap-1.5 text-xs" aria-pressed={overviewOpen} aria-label={overviewOpen ? "Back to session" : "Browse our work"} title={overviewOpen ? "Back to session" : "Browse our work"}>
          {overviewOpen ? <MessageSquare className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{overviewOpen ? "Back to session" : "Our work"}</span>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onOpenHistory} aria-label="Conversation history" title="History">
          <History className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onNew} aria-label="New session" title="New session">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onEnd} aria-label="End session and return home" title="End session">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </motion.div>
);

export default SessionDock;
