import { AnimatePresence, motion } from "framer-motion";
import { Calculator, GitBranch, CalendarRange, Layers, Loader2 } from "lucide-react";
import InlineModuleCard from "@/components/genui/InlineModuleCard";
import type { ModuleDeployment } from "@/components/genui/parseModules";

interface BlueprintPanelProps {
  title: string;
  modules: ModuleDeployment[];
  isLoading: boolean;
  turns: number;
  onRemoveModule: (index: number) => void;
  onSendMessage: (text: string) => void;
}

/** Slots the consultant can fill. Each one asks the assistant to generate that view. */
const SLOTS = [
  { type: "process_flow", icon: GitBranch, label: "System architecture", ask: "Show me how the proposed system would work, step by step." },
  { type: "roi_calculator", icon: Calculator, label: "Return estimate", ask: "Help me estimate the return on this project." },
  { type: "timeline", icon: CalendarRange, label: "Delivery timeline", ask: "What would a realistic delivery timeline look like?" },
  { type: "comparison_table", icon: Layers, label: "Option comparison", ask: "Compare the main options I have for this." },
];

const STAGES = ["Discover", "Scope", "Design", "Plan"];

const BlueprintPanel = ({ title, modules, isLoading, turns, onRemoveModule, onSendMessage }: BlueprintPanelProps) => {
  const stage = Math.min(STAGES.length - 1, Math.floor(turns / 2) + (modules.length > 0 ? 1 : 0));
  const openSlots = SLOTS.filter((s) => !modules.some((m) => m.type === s.type));

  return (
    <aside aria-label="Project blueprint" className="chassis flex min-h-[420px] flex-col overflow-hidden lg:min-h-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="hw-label flex items-center gap-2">
          <span className={`led ${isLoading ? "led-pulse" : modules.length ? "" : "led-off"}`} /> Blueprint
        </span>
        <span className="hw-label">{modules.length} {modules.length === 1 ? "view" : "views"}</span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {/* Brief */}
        <div className="inset-well p-4">
          <p className="hw-label">Project brief</p>
          <h2 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-foreground">{title}</h2>
          <ol className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Consultation progress">
            {STAGES.map((s, i) => (
              <li key={s}>
                <div className={`h-1 rounded-full transition-colors ${i <= stage ? "bg-accent" : "bg-border"}`} />
                <p className={`mt-1.5 font-mono text-[10px] uppercase tracking-wider ${i === stage ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Generated views */}
        <AnimatePresence initial={false}>
          {modules.map((mod, i) => (
            <motion.div
              key={mod.type}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <InlineModuleCard mod={mod} onRemove={() => onRemoveModule(i)} onSendMessage={onSendMessage} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-[var(--radius)] border border-dashed border-accent/50 px-4 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> The consultant may add a view here…
          </div>
        )}

        {/* Open slots */}
        {openSlots.length > 0 && (
          <div>
            <p className="hw-label mb-2">{modules.length ? "Add to blueprint" : "Build your blueprint"}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {openSlots.map((slot) => (
                <button
                  key={slot.type}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSendMessage(slot.ask)}
                  className="tactile-key group flex items-center gap-3 px-3.5 py-3 text-left disabled:opacity-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors group-hover:border-accent group-hover:text-accent">
                    <slot.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{slot.label}</span>
                </button>
              ))}
            </div>
            {!modules.length && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                As you talk, diagrams, estimates and timelines appear here. Pick one to start.
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default BlueprintPanel;
