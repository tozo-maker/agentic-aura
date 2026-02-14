import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import SocialProof from "@/components/SocialProof";
import OmniBar from "@/components/OmniBar";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import TrustProtocol from "@/components/TrustProtocol";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";
import { WizardProvider } from "@/components/wizard/WizardProvider";

const Index = () => {
  const [omniBarOpen, setOmniBarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatIntent, setChatIntent] = useState<string | null>(null);
  const [chatWizardId, setChatWizardId] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
  const servicesRef = useRef<HTMLElement>(null);

  const openOmniBar = useCallback(() => setOmniBarOpen(true), []);
  const closeOmniBar = useCallback(() => setOmniBarOpen(false), []);
  const toggleChat = useCallback(() => setChatOpen((prev) => !prev), []);

  const openChat = useCallback((intent?: string, wizardId?: string) => {
    setChatIntent(intent || null);
    setChatWizardId(wizardId || null);
    setChatOpen(true);
  }, []);

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
    <WizardProvider>
      <motion.main
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Navbar onOpenChat={() => openChat()} />
        <HeroSection onOpenOmniBar={openOmniBar} onOpenChat={openChat} />
        <SocialProof />
        <BentoGrid ref={servicesRef} activeService={activeService} onOpenChat={(intent) => openChat(intent)} />
        <Testimonials />
        <TrustProtocol />
        <Footer />

        <OmniBar
          open={omniBarOpen}
          onClose={closeOmniBar}
          onOpenChat={openChat}
          onScrollToServices={scrollToServices}
        />
        <AIChat
          open={chatOpen}
          onToggle={toggleChat}
          initialIntent={chatIntent}
          wizardId={chatWizardId}
          onActiveService={setActiveService}
        />
      </motion.main>
    </WizardProvider>
  );
};

export default Index;
