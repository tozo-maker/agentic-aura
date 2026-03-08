import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, Sun, Moon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface NavbarProps {
  onOpenChat: () => void;
  compact?: boolean;
  onBack?: () => void;
}

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "Results", href: "#results" },
];

const Navbar = ({ onOpenChat, compact, onBack }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const bgOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.15]);

  // Pre-compute motion styles (hooks called unconditionally)
  const bgColor = useTransform(bgOpacity, (v) => `hsl(var(--background) / ${v * 0.85})`);
  const blurFilter = useTransform(bgOpacity, (v) => `blur(${v * 20}px)`);
  const borderStyle = useTransform(borderOpacity, (v) => `1px solid hsl(var(--border) / ${v})`);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        className={compact 
          ? "fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-card border-b border-border" 
          : "fixed top-0 left-0 right-0 z-50 px-6 py-3"
        }
        style={compact ? undefined : {
          backgroundColor: bgColor,
          backdropFilter: blurFilter,
          borderBottom: borderStyle,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            {compact && onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Back to site"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <a href="#" onClick={compact && onBack ? (e) => { e.preventDefault(); onBack(); } : undefined} className="text-xl font-serif font-semibold text-foreground tracking-tight">
              Nexus AI
            </a>
          </div>

          {/* Desktop Links — hide in canvas mode */}
          {!compact && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {!compact && (
              <Button
                size="sm"
                className="hidden md:inline-flex rounded-full px-6 text-sm font-sans"
                onClick={onOpenChat}
              >
                Talk to Our Agent
              </Button>
            )}

            {!compact && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {!compact && mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-[60px] left-0 right-0 z-40 glass border-b border-border px-6 py-6 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-left text-base font-sans text-foreground py-2"
              >
                {link.label}
              </button>
            ))}
            <Button className="rounded-full mt-2 font-sans" onClick={() => { setMobileOpen(false); onOpenChat(); }}>
              Talk to Our Agent
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
