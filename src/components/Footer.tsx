import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NexusMark from "@/components/NexusMark";
interface FooterProps { onScheduleCall?: () => void; }
const Footer = ({ onScheduleCall }: FooterProps) => (
  <footer className="border-t border-border px-5 pb-8 pt-16 sm:px-8 sm:pt-20">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col items-start justify-between gap-8 pb-16 sm:flex-row sm:items-end"><div><p className="mb-4 text-sm text-muted-foreground">A useful place to begin</p><h2 className="max-w-xl text-3xl leading-tight sm:text-4xl">Bring the problem.<br />We’ll think it through.</h2></div><Button variant="link" className="h-auto p-0 text-base" onClick={onScheduleCall}>Talk to a human <ArrowUpRight /></Button></div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border pt-7"><a href="/" className="flex items-center gap-3 font-medium"><NexusMark className="h-5 w-5" />Nexus AI</a><div className="flex gap-6 text-xs text-muted-foreground"><Link to="/privacy" className="hover:text-foreground">Privacy</Link><Link to="/terms" className="hover:text-foreground">Terms</Link><span>© {new Date().getFullYear()} Nexus AI</span></div></div>
    </div>
  </footer>
);
export default Footer;
