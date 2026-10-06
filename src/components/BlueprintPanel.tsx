import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import InlineModuleCard from "@/components/genui/InlineModuleCard";
import { Button } from "@/components/ui/button";
import type { ModuleDeployment } from "@/components/genui/parseModules";

interface BlueprintPanelProps {
  title: string;
  modules: ModuleDeployment[];
  isLoading: boolean;
  turns: number;
  onRemoveModule: (index: number) => void;
  onSendMessage: (text: string) => void;
}
const views = [
  { type: "process_flow", label: "Architecture", ask: "Based on what I've shared, propose a system architecture. Identify assumptions and questions that still need answers." },
  { type: "comparison_table", label: "Options", ask: "Compare realistic options for my project, including trade-offs and assumptions." },
  { type: "timeline", label: "Timeline", ask: "Propose an implementation timeline for my project, clearly stating assumptions and dependencies." },
  { type: "roi_calculator", label: "Estimate", ask: "Help me estimate potential return using my own inputs. Clearly label estimates and assumptions." },
];
const BlueprintPanel = ({ title, modules, isLoading, onRemoveModule, onSendMessage }: BlueprintPanelProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const available = views.filter((view) => !modules.some((mod) => mod.type === view.type));
  return (
    <aside id="project-blueprint" aria-label="Project blueprint" className="flex min-h-[350px] min-w-0 flex-col border-t border-border bg-muted/35 lg:min-h-0 lg:border-l lg:border-t-0">
      <header className="flex min-h-[52px] items-center justify-between border-b border-border px-5"><h2 className="font-sans text-sm font-medium">Your project</h2>{modules.length > 0 && available.length > 0 && <Button variant="ghost" size="icon-sm" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Close view options" : "Add a project view"} title={menuOpen ? "Close view options" : "Add a project view"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Plus />}</Button>}</header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
        <p className="text-xs text-muted-foreground">{modules.length ? "Working proposal" : "Starting point"}</p>
        <h3 className="mt-3 break-words text-2xl leading-snug">{title}</h3>
        {menuOpen && <div className="mt-6 flex flex-wrap gap-2">{available.map((view) => <Button key={view.type} variant="outline" size="sm" disabled={isLoading} onClick={() => { onSendMessage(view.ask); setMenuOpen(false); }}>{view.label}<Plus /></Button>)}</div>}
        <AnimatePresence initial={false}>{modules.map((mod, i) => <motion.div key={`${mod.type}-${i}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mt-7"><InlineModuleCard mod={mod} onRemove={() => onRemoveModule(i)} onSendMessage={onSendMessage} /></motion.div>)}</AnimatePresence>
        {!modules.length && <div className="mt-10 border-t border-border pt-7"><p className="max-w-sm text-base leading-relaxed text-muted-foreground">No solution proposed yet.</p><Button variant="link" className="mt-5 h-auto whitespace-normal p-0 text-left" disabled={isLoading} onClick={() => onSendMessage(views[0].ask)}>Explore the architecture <ArrowRight /></Button></div>}
      </div>
    </aside>
  );
};
export default BlueprintPanel;
