import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ConversationThread from "@/components/ConversationThread";
import ThreadSidebar from "@/components/ThreadSidebar";
import AmbientInputBar from "@/components/AmbientInputBar";
import { WizardProvider } from "@/components/wizard/WizardProvider";
import { useAIChat } from "@/hooks/useAIChat";
import { createThreadRequest } from "@/lib/threads";
import { SERVICE_MODULE_MAP } from "@/lib/serviceModules";

interface ChatLocationState {
  initialMessage?: string;
  serviceId?: string;
}

const ChatInner = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ChatLocationState;

  const chat = useAIChat(threadId);
  const sentInitial = useRef<string | null>(null);

  // Send the message that started this conversation, once per thread.
  useEffect(() => {
    if (!threadId || !state.initialMessage) return;
    if (sentInitial.current === threadId) return;
    sentInitial.current = threadId;

    if (state.serviceId && SERVICE_MODULE_MAP[state.serviceId]) {
      const { type, data } = SERVICE_MODULE_MAP[state.serviceId];
      chat.preloadModule(type, data);
    }
    chat.sendMessage(state.initialMessage);
    navigate(`/chat/${threadId}`, { replace: true, state: {} });
  }, [threadId, state.initialMessage, state.serviceId, chat, navigate]);

  const handleNewThread = useCallback(async () => {
    const thread = await createThreadRequest();
    if (thread) {
      chat.loadThreads();
      navigate(`/chat/${thread.id}`);
    }
  }, [chat, navigate]);

  const handleDelete = useCallback(
    async (id: string) => {
      await chat.deleteThread(id);
      if (id === threadId) navigate("/");
    },
    [chat, threadId, navigate],
  );

  return (
    <div className="min-h-screen bg-secondary/35">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 flex gap-3 sm:gap-4 h-screen">
        <ThreadSidebar
          threads={chat.threads}
          activeId={threadId}
          onSelect={(id) => navigate(`/chat/${id}`)}
          onNew={handleNewThread}
          onDelete={handleDelete}
        />

        <div className="flex-1 min-w-0 flex flex-col bg-background border border-border shadow-[var(--shadow-glass)] overflow-hidden">
          <ConversationThread
            messages={chat.messages}
            isLoading={chat.isLoading}
            deployedModules={chat.deployedModules}
            onRemoveModule={chat.removeDeployedModule}
            onSendMessage={chat.sendMessage}
            wizard={{ schema: chat.wizard.schema, completed: chat.wizard.completed }}
            onWizardStepSubmit={chat.handleWizardStepSubmit}
            onWizardComplete={chat.handleWizardComplete}
            suggestions={chat.suggestions}
            error={chat.error as Error | null}
            onClose={() => navigate("/")}
            onReset={handleNewThread}
          />
          <AmbientInputBar
            onSubmit={(msg) => chat.sendMessage(msg)}
            isLoading={chat.isLoading}
            minimal
            onStop={chat.stop}
          />
        </div>
      </main>
    </div>
  );
};

const Chat = () => (
  <WizardProvider>
    <ChatInner />
  </WizardProvider>
);

export default Chat;
