import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import SocialProof from "@/components/SocialProof";
import OmniBar from "@/components/OmniBar";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import TrustProtocol from "@/components/TrustProtocol";
import Footer from "@/components/Footer";
import FloatingChatBar from "@/components/FloatingChatBar";
import { WizardProvider } from "@/components/wizard/WizardProvider";
import CanvasLayout from "@/components/canvas/CanvasLayout";
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
  const [mode, setMode] = useState<"landing" | "canvas">("landing");
  const [omniBarOpen, setOmniBarOpen] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const servicesRef = useRef<HTMLElement>(null);

  const chat = useAIChat((service) => setActiveService(service));

  const openOmniBar = useCallback(() => setOmniBarOpen(true), []);
  const closeOmniBar = useCallback(() => setOmniBarOpen(false), []);

  const openCanvas = useCallback((intent?: string, serviceId?: string) => {
    // Pre-deploy module if we have a service mapping
    if (serviceId && SERVICE_MODULE_MAP[serviceId]) {
      const { type, data } = SERVICE_MODULE_MAP[serviceId];
      chat.preloadModule(type, data);
    }
    setMode("canvas");
    if (intent) {
      chat.sendMessage(intent);
    }
  }, [chat]);

  const scrollToServices = useCallback(() => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (activeService) {
      const timer = setTimeout(() => setActiveService(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [activeService]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOmniBarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onOpenChat={() => openCanvas()}
        compact={mode === "canvas"}
        onBack={mode === "canvas" ? () => setMode("landing") : undefined}
      />

      <AnimatePresence mode="wait">
        {mode === "landing" ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection onOpenOmniBar={openOmniBar} onOpenChat={(intent) => openCanvas(intent)} />
            <SocialProof />
            <BentoGrid
              ref={servicesRef}
              activeService={activeService}
              onOpenChat={(intent, serviceId) => openCanvas(intent, serviceId)}
            />
            <Testimonials />
            <TrustProtocol />
            <Footer />
            <FloatingChatBar onSubmit={(msg) => openCanvas(msg)} />
          </motion.main>
        ) : (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-16"
          >
            <CanvasLayout
              messages={chat.messages}
              input={chat.input}
              setInput={chat.setInput}
              isLoading={chat.isLoading}
              onSend={chat.send}
              onSendMessage={chat.sendMessage}
              onBack={() => setMode("landing")}
              deployedModules={chat.deployedModules}
              onRemoveModule={chat.removeDeployedModule}
              wizard={{ schema: chat.wizard.schema, completed: chat.wizard.completed }}
              onWizardStepSubmit={chat.handleWizardStepSubmit}
              onWizardComplete={chat.handleWizardComplete}
              suggestions={chat.suggestions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <OmniBar
        open={omniBarOpen}
        onClose={closeOmniBar}
        onOpenChat={(intent) => openCanvas(intent)}
        onScrollToServices={scrollToServices}
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
