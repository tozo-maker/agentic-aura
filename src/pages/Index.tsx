import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import SocialProof from "@/components/SocialProof";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import TrustProtocol from "@/components/TrustProtocol";
import Footer from "@/components/Footer";
import AmbientInputBar from "@/components/AmbientInputBar";
import { createThreadRequest } from "@/lib/threads";

const Index = () => {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const startConversation = useCallback(
    async (text: string, serviceId?: string) => {
      if (starting) return;
      setStarting(true);
      const title = text.length > 60 ? `${text.slice(0, 57)}…` : text;
      const thread = await createThreadRequest(title);
      setStarting(false);
      if (!thread) {
        toast.error("Couldn't start the conversation. Please try again.");
        return;
      }
      navigate(`/chat/${thread.id}`, { state: { initialMessage: text, serviceId } });
    },
    [navigate, starting],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <HeroSection />
        <SocialProof />
        <BentoGrid
          activeService={null}
          onOpenChat={(intent, serviceId) => startConversation(intent, serviceId)}
        />
        <Testimonials />
        <TrustProtocol />
        <Footer onScheduleCall={() => startConversation("I'd like to schedule a call with a human expert")} />
      </main>

      <AmbientInputBar onSubmit={(msg) => startConversation(msg)} isLoading={starting} />
    </div>
  );
};

export default Index;
