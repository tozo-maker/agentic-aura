import { motion } from "framer-motion";
import { MessageSquare, Plus, Trash2, Home } from "lucide-react";
import NexusMark from "@/components/NexusMark";
import { Link } from "react-router-dom";
import type { Thread } from "@/hooks/useAIChat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThreadSidebarProps {
  threads: Thread[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  className?: string;
}

const ThreadSidebar = ({ threads, activeId, onSelect, onNew, onDelete, className }: ThreadSidebarProps) => (
  <aside className={cn("flex flex-col w-full md:w-72 shrink-0 border-r border-border bg-secondary/25 overflow-hidden", className)}>
    <div className="p-4 border-b border-border flex items-center gap-2">
      <Link
        to="/"
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Back to site"
      >
        <NexusMark className="h-5 w-5" /><Home className="sr-only" />
      </Link>
      <Button
        onClick={onNew}
        className="flex-1 h-9 text-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        New conversation
      </Button>
    </div>

    <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Your conversations">
      {threads.length === 0 && (
        <p className="px-3 py-4 text-xs text-muted-foreground font-sans">No saved conversations yet.</p>
      )}
      {threads.map((t) => (
        <motion.div
          key={t.id}
          layout
          className={`group flex items-center gap-2 rounded-md px-2 transition-colors ${
            t.id === activeId ? "bg-secondary" : "hover:bg-secondary/60"
          }`}
        >
          <Button
            onClick={() => onSelect(t.id)}
            variant="ghost"
            className="h-auto flex-1 justify-start gap-2 px-0 py-2 text-left min-w-0 hover:bg-transparent"
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-sans text-foreground truncate">
              {t.title || "New conversation"}
            </span>
          </Button>
          <Button
            onClick={() => onDelete(t.id)}
            aria-label="Delete conversation"
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </motion.div>
      ))}
    </nav>
  </aside>
);

export default ThreadSidebar;
