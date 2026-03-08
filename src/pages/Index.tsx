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
import { WizardProvider } from "@/components/wizard/WizardProvider";
import CanvasLayout from "@/components/canvas/CanvasLayout";
import { useAIChat } from "@/hooks/useAIChat";

const IndexInner = () => {
  const [mode, setMode] = useState<"landing" | "canvas">("landing");
  const [omniBarOpen, setOmniBarOpen] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const servicesRef = useRef<HTMLElement>(null);

  const chat = useAIChat((service) => setActiveService(service));

  const openOmniBar = useCallback(() => setOmniBarOpen(true), []);
  const closeOmniBar = useCallback(() => setOmniBarOpen(false), []);

  const openCanvas = useCallback((intent?: string) => {
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
            <BentoGrid ref={servicesRef} activeService={activeService} onOpenChat={(intent) => openCanvas(intent)} />
            <Testimonials />
            <TrustProtocol />
            <Footer />
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
