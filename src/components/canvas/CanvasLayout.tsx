import ChatRail from "./ChatRail";
import WelcomeCards from "./WelcomeCards";
import CanvasModuleView from "./CanvasModuleView";
import type { Msg } from "@/hooks/useAIChat";
import type { ModuleDeployment } from "@/components/genui/parseModules";

interface CanvasLayoutProps {
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  deployedModules: ModuleDeployment[];
  onRemoveModule: (index: number) => void;
  wizard: { schema: any; completed: boolean };
  onWizardStepSubmit: (data: Record<string, string>) => void;
  onWizardComplete: () => void;
  suggestions: string[];
}

const CanvasLayout = ({
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onSendMessage,
  onBack,
  deployedModules,
  onRemoveModule,
  wizard,
  onWizardStepSubmit,
  onWizardComplete,
  suggestions,
}: CanvasLayoutProps) => {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Chat Rail */}
      <ChatRail
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSend={onSend}
        onSendMessage={onSendMessage}
        onBack={onBack}
        wizard={wizard}
        onWizardStepSubmit={onWizardStepSubmit}
        onWizardComplete={onWizardComplete}
        suggestions={suggestions}
      />

      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto bg-background">
        {deployedModules.length === 0 ? (
          <WelcomeCards onSend={onSendMessage} />
        ) : (
          <CanvasModuleView
            modules={deployedModules}
            onRemove={onRemoveModule}
            onAskAbout={onSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default CanvasLayout;
