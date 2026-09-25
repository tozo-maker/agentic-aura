import type { WizardField } from "./wizardSchemas";
import { Button } from "@/components/ui/button";

interface FieldRendererProps {
  field: WizardField;
  value: string;
  onChange: (value: string) => void;
}

const FieldRenderer = ({ field, value, onChange }: FieldRendererProps) => {
  const base = "w-full rounded-md bg-background border border-input px-3 py-2 text-sm font-sans text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-colors";

  switch (field.type) {
    case "text":
    case "email":
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-medium text-muted-foreground">{field.label}</label>
          <input
            type={field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={base}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-medium text-muted-foreground">{field.label}</label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={base + " resize-none"}
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-medium text-muted-foreground">{field.label}</label>
          <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
            <option value="">Select…</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-medium text-muted-foreground">{field.label}</label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((o) => (
              <Button
                key={o.value}
                type="button"
                onClick={() => onChange(o.value)}
                variant="outline"
                size="sm"
                className={`text-xs ${
                  value === o.value
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "bg-secondary/60 text-foreground border-border hover:border-muted-foreground"
                }`}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default FieldRenderer;
