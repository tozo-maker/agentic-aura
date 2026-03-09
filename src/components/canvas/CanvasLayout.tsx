import ChatRail from "./ChatRail";
import WelcomeCards from "./WelcomeCards";
import CanvasModuleView from "./CanvasModuleView";
import MobileChatDrawer from "./MobileChatDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  const chatProps = {
    messages,
    input,
    setInput,
    isLoading,
    onSend,
    onSendMessage,
    onBack,
    wizard,
    onWizardStepSubmit,
    onWizardComplete,
    suggestions,
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Desktop Chat Rail */}
      {!isMobile && <ChatRail {...chatProps} />}

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

      {/* Mobile Chat Drawer */}
      {isMobile && <MobileChatDrawer {...chatProps} />}
    </div>
  );
};

export default CanvasLayout;
