import { cn } from "@/lib/utils";

interface NexusMarkProps {
  className?: string;
}

const NexusMark = ({ className }: NexusMarkProps) => (
  <span
    aria-hidden="true"
    className={cn("relative block h-7 w-7 shrink-0", className)}
  >
    <span className="absolute left-0 top-0 h-4 w-4 border border-current" />
    <span className="absolute bottom-0 right-0 h-4 w-4 bg-primary" />
  </span>
);

export default NexusMark;