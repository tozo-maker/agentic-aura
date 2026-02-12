import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useWizard } from "./WizardProvider";
import FieldRenderer from "./FieldRenderer";
import WizardProgress from "./WizardProgress";

interface WizardCardProps {
  onStepSubmit: (stepData: Record<string, string>) => void;
  onComplete: () => void;
}

const WizardCard = ({ onStepSubmit, onComplete }: WizardCardProps) => {
  const { schema, stepIndex, data, updateField, nextStep, prevStep, completed } = useWizard();

  if (!schema || completed) return null;

  const step = schema.steps[stepIndex];
  const isLast = stepIndex === schema.steps.length - 1;

  const stepFieldsFilled = step.fields.every(
    (f) => !f.required || (data[f.id] && data[f.id].trim() !== "")
  );

  const handleNext = () => {
    const stepData: Record<string, string> = {};
    step.fields.forEach((f) => { if (data[f.id]) stepData[f.id] = data[f.id]; });
    onStepSubmit(stepData);

    if (isLast) {
      onComplete();
    } else {
      nextStep();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 my-2 rounded-xl glass border border-border overflow-hidden"
    >
      <div className="px-4 pt-3 pb-2 space-y-2">
        <WizardProgress current={stepIndex} total={schema.steps.length} />
        <p className="text-xs font-sans text-muted-foreground">
          Step {stepIndex + 1} of {schema.steps.length} · {step.title}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-3 space-y-3"
        >
          {step.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={data[field.id] || ""}
              onChange={(v) => updateField(field.id, v)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <button
          onClick={prevStep}
          disabled={stepIndex === 0}
          className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!stepFieldsFilled}
          className="flex items-center gap-1 text-xs font-sans font-medium bg-foreground text-primary-foreground px-3 py-1.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLast ? (
            <>Complete <Check className="w-3.5 h-3.5" /></>
          ) : (
            <>Next <ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default WizardCard;
