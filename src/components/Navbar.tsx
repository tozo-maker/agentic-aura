import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import NexusMark from "@/components/NexusMark";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "Results", href: "#results" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const bgOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.15]);
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
        className="fixed top-0 left-0 right-0 z-50 px-5 py-4"
        style={{
          backgroundColor: bgColor,
          backdropFilter: blurFilter,
          borderBottom: borderStyle,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 text-lg font-sans font-semibold text-foreground">
            <NexusMark className="h-6 w-6" /> Nexus AI
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground"
              >
                {link.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}

            <Button
              onClick={() => setMobileOpen(!mobileOpen)}
              variant="ghost"
              size="icon-sm"
              className="md:hidden text-muted-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-[60px] left-0 right-0 z-40 glass border-b border-border px-6 py-6 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                variant="ghost"
                className="justify-start text-left text-base font-sans text-foreground py-2"
              >
                {link.label}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
