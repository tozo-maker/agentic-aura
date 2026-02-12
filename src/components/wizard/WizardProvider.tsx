import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type WizardSchema, wizardSchemas } from "./wizardSchemas";
import { supabase } from "@/integrations/supabase/client";

interface WizardState {
  schema: WizardSchema | null;
  stepIndex: number;
  data: Record<string, string>;
  completed: boolean;
}

interface WizardContextValue extends WizardState {
  startWizard: (wizardId: string) => void;
  updateField: (fieldId: string, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeWizard: (sessionId: string) => Promise<void>;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
};

const initial: WizardState = { schema: null, stepIndex: 0, data: {}, completed: false };

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WizardState>(initial);

  const startWizard = useCallback((wizardId: string) => {
    const schema = wizardSchemas[wizardId];
    if (!schema) return;
    setState({ schema, stepIndex: 0, data: {}, completed: false });
  }, []);

  const updateField = useCallback((fieldId: string, value: string) => {
    setState((s) => ({ ...s, data: { ...s.data, [fieldId]: value } }));
  }, []);

  const nextStep = useCallback(() => {
    setState((s) => {
      if (!s.schema) return s;
      if (s.stepIndex >= s.schema.steps.length - 1) return s;
      return { ...s, stepIndex: s.stepIndex + 1 };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((s) => (s.stepIndex > 0 ? { ...s, stepIndex: s.stepIndex - 1 } : s));
  }, []);

  const completeWizard = useCallback(async (sessionId: string) => {
    if (!state.schema) return;
    const d = state.data;
    await supabase.from("leads").insert({
      session_id: sessionId,
      company: d.company_name || null,
      budget_range: d.budget_range || null,
      timeline: d.timeline || null,
      intent_category: state.schema.id,
    });
    setState((s) => ({ ...s, completed: true }));
  }, [state.schema, state.data]);

  const resetWizard = useCallback(() => setState(initial), []);

  return (
    <WizardContext.Provider
      value={{ ...state, startWizard, updateField, nextStep, prevStep, completeWizard, resetWizard }}
    >
      {children}
    </WizardContext.Provider>
  );
};
