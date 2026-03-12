import { Link } from "react-router-dom";
import RevealOnScroll from "./RevealOnScroll";

const serviceLinks = [
  { label: "Agentic Commerce", href: "#services" },
  { label: "Workflow Automation", href: "#services" },
  { label: "Generative UI", href: "#services" },
  { label: "Self-Healing Infra", href: "#services" },
  { label: "AI Support", href: "#services" },
  { label: "Data Intelligence", href: "#services" },
];

const companyLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

interface FooterProps {
  onScheduleCall?: () => void;
}

const Footer = ({ onScheduleCall }: FooterProps) => {
  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border py-16 px-6 noise-overlay">
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">Nexus AI</h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-6">
                Hybrid intelligence systems that think, adapt, and act—with a human always in the loop.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-sans font-semibold text-foreground mb-4 uppercase tracking-wider">Services</h4>
              <ul className="space-y-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-sans font-semibold text-foreground mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={onScheduleCall}
                className="mt-6 text-sm font-sans font-medium bg-foreground text-primary-foreground rounded-full px-5 py-2 hover:opacity-90 transition-opacity"
              >
                Schedule a Call
              </button>
            </div>
          </div>
        </RevealOnScroll>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-muted-foreground">
            © {new Date().getFullYear()} Nexus AI. All rights reserved.
          </p>
          <p className="text-xs font-sans text-muted-foreground">
            Built with hybrid intelligence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
