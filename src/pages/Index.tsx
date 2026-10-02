import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import BentoGrid from "@/components/BentoGrid";
import TrustProtocol from "@/components/TrustProtocol";
import Footer from "@/components/Footer";
import SessionDock from "@/components/SessionDock";
import ConversationThread from "@/components/ConversationThread";
import AmbientInputBar from "@/components/AmbientInputBar";
import ThreadSidebar from "@/components/ThreadSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { WizardProvider } from "@/components/wizard/WizardProvider";
import { useAIChat } from "@/hooks/useAIChat";
import { createThreadRequest } from "@/lib/threads";
import { SERVICE_MODULE_MAP } from "@/lib/serviceModules";

const spring = { type: "spring" as const, stiffness: 220, damping: 30 };

const PortalInner = () => {
  const params = useParams<{ threadId?: string }>();
  const reduceMotion = useReducedMotion();
  const [threadId, setThreadId] = useState<string | undefined>(params.threadId);
  const [overview, setOverview] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [pending, setPending] = useState<{ text: string; serviceId?: string } | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);

  const chat = useAIChat(threadId, setActiveService);
  const inSession = Boolean(threadId);
  const canvasVisible = inSession && !overview;

  // Keep the address bar in sync without remounting the portal.
  const syncUrl = (id?: string) => window.history.replaceState(null, "", id ? `/chat/${id}` : "/");

  // Send the message that opened the session once the thread is active.
  useEffect(() => {
    if (!pending || !threadId) return;
    if (pending.serviceId && SERVICE_MODULE_MAP[pending.serviceId]) {
      const { type, data } = SERVICE_MODULE_MAP[pending.serviceId];
      chat.preloadModule(type, data);
    }
    chat.sendMessage(pending.text);
    setPending(null);
  }, [pending, threadId, chat]);

  const openThread = useCallback(async (title?: string) => {
    const thread = await createThreadRequest(title);
    if (!thread) {
      toast.error("Couldn't start the session. Please try again.");
      return null;
    }
    setThreadId(thread.id);
    syncUrl(thread.id);
    chat.loadThreads();
    return thread.id;
  }, [chat]);

  const startConversation = useCallback(
    async (text: string, serviceId?: string) => {
      setOverview(false);
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      if (threadId) {
        if (serviceId && SERVICE_MODULE_MAP[serviceId]) {
          const { type, data } = SERVICE_MODULE_MAP[serviceId];
          chat.preloadModule(type, data);
        }
        chat.sendMessage(text);
        return;
      }
      if (starting) return;
      setStarting(true);
      const id = await openThread(text.length > 60 ? `${text.slice(0, 57)}…` : text);
      setStarting(false);
      if (id) setPending({ text, serviceId });
    },
    [threadId, starting, openThread, chat, reduceMotion],
  );

  const endSession = () => {
    chat.reset();
    setThreadId(undefined);
    setOverview(false);
    syncUrl();
    window.scrollTo({ top: 0 });
  };

  const selectThread = (id: string) => {
    setHistoryOpen(false);
    setOverview(false);
    setThreadId(id);
    syncUrl(id);
  };

  const newSession = async () => {
    setHistoryOpen(false);
    chat.reset();
    setOverview(false);
    await openThread();
  };

  const deleteThread = async (id: string) => {
    await chat.deleteThread(id);
    if (id === threadId) endSession();
  };

  const toggleOverview = () => {
    setOverview((v) => !v);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const sessionTitle = chat.threads.find((t) => t.id === threadId)?.title || "New consultation";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <AnimatePresence initial={false} mode="popLayout">
        {!inSession && (
          <motion.div
            key="hero"
            layoutId="nexus-stage-head"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.98, filter: "blur(6px)" }}
            transition={spring}
          >
            <HeroSection onSubmit={(m) => startConversation(m)} isLoading={starting} />
          </motion.div>
        )}
      </AnimatePresence>

      {inSession && (
        <div className="pt-[64px]">
          <SessionDock
            title={sessionTitle}
            isLoading={chat.isLoading}
            overviewOpen={overview}
            onToggleOverview={toggleOverview}
            onOpenHistory={() => setHistoryOpen(true)}
            onNew={newSession}
            onEnd={endSession}
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        {canvasVisible && (
          <motion.section
            key="canvas"
            aria-label="Consultation canvas"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24, height: 0 }}
            transition={spring}
            className={`ambient-field relative flex h-[calc(100dvh-64px-57px)] flex-col overflow-hidden ${chat.isLoading ? "is-thinking" : ""}`}
          >
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
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
                embedded
              />
              <div className="mx-auto w-full max-w-4xl px-4 pb-4 sm:px-8 sm:pb-6">
                <AmbientInputBar onSubmit={(m) => chat.sendMessage(m)} isLoading={chat.isLoading} onStop={chat.stop} variant="chat" />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(!inSession || overview) && (
          <motion.main
            key="showcase"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
          >
            <BentoGrid activeService={activeService} onOpenChat={(intent, serviceId) => startConversation(intent, serviceId)} />
            <TrustProtocol />
            <Footer onScheduleCall={() => startConversation("I'd like to schedule a call with a human expert")} />
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inSession && overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={spring}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <Button onClick={toggleOverview} className="gap-2 rounded-full px-5 shadow-[var(--shadow-elevated)]">
              <ArrowUp className="h-4 w-4" /> Return to your session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-[88vw] max-w-sm p-0">
          <SheetTitle className="sr-only">Conversation history</SheetTitle>
          <ThreadSidebar
            className="h-full w-full border-0 md:w-full"
            threads={chat.threads}
            activeId={threadId}
            onSelect={selectThread}
            onNew={newSession}
            onDelete={deleteThread}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Index = () => (
  <WizardProvider>
    <PortalInner />
  </WizardProvider>
);

export default Index;
