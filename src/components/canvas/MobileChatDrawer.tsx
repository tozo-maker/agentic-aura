import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { MessageCircle } from "lucide-react";
import ChatRail from "./ChatRail";
import type { Msg } from "@/hooks/useAIChat";

interface MobileChatDrawerProps {
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  wizard: { schema: any; completed: boolean };
  onWizardStepSubmit: (data: Record<string, string>) => void;
  onWizardComplete: () => void;
  suggestions: string[];
}

const MobileChatDrawer = (props: MobileChatDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-foreground text-primary-foreground flex items-center justify-center shadow-lg md:hidden">
          <MessageCircle className="w-6 h-6" />
          {props.isLoading && (
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-destructive animate-pulse" />
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] p-0">
        <div className="h-full">
          <ChatRail {...props} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileChatDrawer;
