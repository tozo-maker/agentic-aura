const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm font-sans text-muted-foreground">
          © {new Date().getFullYear()} Nexus AI. Built with hybrid intelligence.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
