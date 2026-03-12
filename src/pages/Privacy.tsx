import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-4xl font-serif font-semibold text-foreground mb-8">Privacy Policy</h1>
        <p className="text-xs font-sans text-muted-foreground mb-12">Last updated: March 12, 2026</p>

        <div className="space-y-8 text-sm font-sans text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              When you interact with our AI consultant, we collect the messages you send, your session identifier, and any contact information you voluntarily provide (name, email, company). We do not collect personal data passively beyond standard web analytics (page views, device type).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information you provide to respond to your inquiries, qualify your project needs, and follow up with relevant service proposals. Conversation data is used to improve our AI responses and service offerings. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">3. Data Retention</h2>
            <p className="text-muted-foreground">
              Chat session data is retained for up to 90 days for follow-up and quality improvement purposes. Lead contact information is retained until you request deletion. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              All data is transmitted over encrypted connections (TLS 1.3). Conversation data is stored in access-controlled databases. We follow industry-standard security practices to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise these rights, please contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">6. Cookies & Local Storage</h2>
            <p className="text-muted-foreground">
              We use localStorage to maintain your chat session across page reloads. No third-party tracking cookies are used. You can clear this data at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground">
              For privacy inquiries, data deletion requests, or questions about this policy, contact us at{" "}
              <a href="mailto:privacy@nexusai.com" className="text-foreground underline hover:no-underline">privacy@nexusai.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
