import { useState } from "react";
import VoiceToggle from "@/components/VoiceToggle";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
interface AmbientInputBarProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  minimal?: boolean;
  onStop?: () => void;
  variant?: "hero" | "chat";
}
const AmbientInputBar = ({ onSubmit, isLoading = false, onStop }: AmbientInputBarProps) => {
  const [value, setValue] = useState("");
  return (
    <div className="w-full pb-[env(safe-area-inset-bottom)]">
      <PromptInput onSubmit={(message) => { const text = message.text?.trim(); if (!text || isLoading) return; onSubmit(text); setValue(""); }} className="rounded-md border-border bg-card">
        <PromptInputTextarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Tell us a little more…" aria-label="Message the Nexus AI consultant" disabled={isLoading} className="min-h-14 px-4 pt-3.5 text-base" />
        <PromptInputFooter className="px-3 pb-3"><PromptInputTools><VoiceToggle onTranscript={(text) => { if (!isLoading) setValue((v) => `${v} ${text}`.trim()); }} disabled={isLoading} /></PromptInputTools><PromptInputSubmit status={isLoading ? "streaming" : "ready"} onStop={onStop} disabled={!value.trim() && !isLoading} className="bg-primary text-primary-foreground" /></PromptInputFooter>
      </PromptInput>
    </div>
  );
};
export default AmbientInputBar;
