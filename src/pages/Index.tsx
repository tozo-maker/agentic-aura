import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import SocialProof from "@/components/SocialProof";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import TrustProtocol from "@/components/TrustProtocol";
import Footer from "@/components/Footer";
import AmbientInputBar from "@/components/AmbientInputBar";
import ConversationThread from "@/components/ConversationThread";
import { WizardProvider } from "@/components/wizard/WizardProvider";
import { useAIChat } from "@/hooks/useAIChat";

const SERVICE_MODULE_MAP: Record<string, { type: string; data: Record<string, any> }> = {
  commerce: {
    type: "service_spotlight",
    data: {
      serviceId: "commerce",
      title: "Agentic Commerce",
      description: "Headless Medusa v2 storefronts with AI-powered product discovery, dynamic pricing, and autonomous inventory management.",
      features: ["Headless Medusa v2", "AI product discovery", "Dynamic pricing", "Autonomous inventory"],
      highlight: "Full-stack commerce",
      useCases: ["DTC brands", "B2B wholesale", "Marketplace"],
    },
  },
  automation: {
    type: "process_flow",
    data: {
      title: "Workflow Automation",
      steps: [
        { name: "Audit", description: "Map your current manual processes and identify automation opportunities" },
        { name: "Design", description: "Build n8n workflows with AI decision nodes and human checkpoints" },
        { name: "Integrate", description: "Connect your entire tool stack — CRM, ERP, comms, databases" },
        { name: "Monitor", description: "Real-time dashboards with self-healing error recovery" },
      ],
    },
  },
  generative_ui: {
    type: "service_spotlight",
    data: {
      serviceId: "generative_ui",
      title: "Generative UI",
      description: "Interfaces that adapt in real-time based on user behavior, context, and intent.",
      features: ["Adaptive layouts", "Context-aware components", "Real-time personalization", "AI-driven UX"],
      highlight: "Every visitor gets a unique experience",
      useCases: ["SaaS platforms", "E-commerce", "Content sites"],
    },
  },
  infrastructure: {
    type: "service_spotlight",
    data: {
      serviceId: "infrastructure",
      title: "Self-Healing Infrastructure",
      description: "Dockerized sovereign hosting with automated failover, uptime monitoring, and zero-downtime deployments.",
      features: ["Docker orchestration", "Auto-failover", "24/7 uptime monitoring", "Zero-downtime deploys"],
      highlight: "99.99% uptime SLA",
      useCases: ["High-traffic apps", "Mission-critical systems", "Multi-region deploys"],
    },
  },
  ai_support: {
    type: "service_spotlight",
    data: {
      serviceId: "ai_support",
      title: "AI Customer Support",
      description: "Intelligent support agents that resolve 80% of queries autonomously, with seamless human escalation.",
      features: ["24/7 availability", "Multi-language", "Human escalation", "Sentiment analysis"],
      highlight: "80% automation rate",
      useCases: ["E-commerce", "SaaS", "Healthcare"],
    },
  },
  data_intelligence: {
    type: "service_spotlight",
    data: {
      serviceId: "data_intelligence",
      title: "Data Intelligence",
      description: "Automated reporting pipelines that transform raw data into actionable business insights.",
      features: ["Automated ETL", "Real-time dashboards", "Predictive analytics", "Custom reports"],
      highlight: "Data-driven decisions",
      useCases: ["Business intelligence", "Marketing analytics", "Operations"],
    },
  },
};

const IndexInner = () => {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const servicesRef = useRef<HTMLElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const chat = useAIChat((service) => setActiveService(service));

  const hasConversation = !closed && (chat.messages.length > 1 || chat.deployedModules.length > 0);

  const handleSendMessage = useCallback((text: string, serviceId?: string) => {
    setClosed(false);
    if (serviceId && SERVICE_MODULE_MAP[serviceId]) {
      const { type, data } = SERVICE_MODULE_MAP[serviceId];
      chat.preloadModule(type, data);
    }
    chat.sendMessage(text);
    setTimeout(() => {
      threadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [chat]);

  const handleScheduleCall = useCallback(() => {
    handleSendMessage("I'd like to schedule a call with a human expert");
  }, [handleSendMessage]);

  const handleClose = useCallback(() => {
    chat.stop();
    setClosed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [chat]);

  const handleReset = useCallback(() => {
    chat.reset();
    setClosed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (!hasConversation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasConversation, handleClose]);

  useEffect(() => {
    if (activeService) {
      const timer = setTimeout(() => setActiveService(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [activeService]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero — collapses into a compact header while a conversation is active */}
        <AnimatePresence mode="wait">
          {!hasConversation ? (
            <motion.div
              key="hero-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <HeroSection />
              <SocialProof />
            </motion.div>
          ) : (
            <motion.div
              key="hero-compact"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pt-24 pb-2 px-6 text-center"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
                Nexus AI
              </h2>
              <p className="text-sm text-muted-foreground font-sans mt-1">
                Your AI consultant — ask anything
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation Thread — appears inline */}
        {hasConversation && (
          <div ref={threadRef}>
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
              onClose={handleClose}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Marketing sections — step aside while the conversation has focus */}
        <AnimatePresence initial={false}>
          {!hasConversation && (
            <motion.div
              key="marketing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <BentoGrid
                ref={servicesRef}
                activeService={activeService}
                onOpenChat={(intent, serviceId) => handleSendMessage(intent, serviceId)}
              />
              <Testimonials />
              <TrustProtocol />
              <Footer onScheduleCall={handleScheduleCall} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ambient Input Bar — always present */}
      <AmbientInputBar
        onSubmit={(msg) => handleSendMessage(msg)}
        isLoading={chat.isLoading}
        minimal={hasConversation}
        onStop={chat.stop}
      />
    </div>
  );
};

const Index = () => (
  <WizardProvider>
    <IndexInner />
  </WizardProvider>
);

export default Index;
