import { useRef, useEffect } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import VoiceToggle from "@/components/VoiceToggle";
import WizardCard from "@/components/wizard/WizardCard";
import type { Msg } from "@/hooks/useAIChat";
import type { ModuleDeployment } from "@/components/genui/parseModules";

interface ChatRailProps {
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  wizard: {
    schema: any;
    completed: boolean;
  };
  onWizardStepSubmit: (data: Record<string, string>) => void;
  onWizardComplete: () => void;
}

const ChatRail = ({
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
}: ChatRailProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleMessages = messages.filter((m) => !m.hidden || m.role === "module");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-border bg-card shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Back to site"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-sm font-sans font-semibold text-foreground">Nexus AI</h3>
          <p className="text-xs text-muted-foreground">Canvas Mode</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {visibleMessages.map((msg, i) => {
          if (msg.role === "module") {
            return (
              <div key={`mod-${i}`} className="flex justify-start">
                <div className="bg-accent/50 rounded-xl px-3 py-2 text-xs text-muted-foreground font-sans flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Module deployed to canvas
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm font-sans leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_p]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}

        {wizard.schema && !wizard.completed && (
          <WizardCard onStepSubmit={onWizardStepSubmit} onComplete={onWizardComplete} />
        )}

        {isLoading && visibleMessages[visibleMessages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
          <VoiceToggle onTranscript={(t) => onSendMessage(t)} disabled={isLoading} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm font-sans outline-none text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={onSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRail;
