import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-4xl font-serif font-semibold text-foreground mb-8">Terms of Service</h1>
        <p className="text-xs font-sans text-muted-foreground mb-12">Last updated: March 12, 2026</p>

        <div className="space-y-8 text-sm font-sans text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">1. Service Description</h2>
            <p className="text-muted-foreground">
              Nexus AI provides hybrid intelligence consulting services, including AI-powered workflow automation, commerce solutions, infrastructure management, and customer support systems. Our AI consultant on this website provides preliminary project scoping and service information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">2. AI Interactions</h2>
            <p className="text-muted-foreground">
              Our AI consultant provides general guidance and project scoping. All recommendations are preliminary and subject to human review. Final project proposals, pricing, and timelines are confirmed by our human team. AI-generated estimates are indicative only and do not constitute binding offers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">3. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree to use the AI consultant for legitimate business inquiry purposes. You shall not attempt to exploit, manipulate, or reverse-engineer the AI system. Abusive, harmful, or fraudulent use is prohibited and may result in session termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">4. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, designs, and materials on this website are the property of Nexus AI. Proposals and solutions discussed during AI consultations remain our intellectual property until a service agreement is executed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Nexus AI is not liable for any decisions made based on AI consultant recommendations. Our liability is limited to the fees paid for contracted services. We make no warranties regarding AI response accuracy or completeness.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">6. Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance. Material changes will be communicated through the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@nexusai.com" className="text-foreground underline hover:no-underline">legal@nexusai.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
