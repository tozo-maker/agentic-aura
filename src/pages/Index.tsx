import { useState, useEffect, useCallback, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import OmniBar from "@/components/OmniBar";
import BentoGrid from "@/components/BentoGrid";
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

  // Clear active service highlight after a delay
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
      <main className="min-h-screen bg-background">
        <HeroSection onOpenOmniBar={openOmniBar} onOpenChat={openChat} />
        <BentoGrid ref={servicesRef} activeService={activeService} />
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
      </main>
    </WizardProvider>
  );
};

export default Index;
