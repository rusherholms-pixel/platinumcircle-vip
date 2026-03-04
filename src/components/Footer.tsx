const Footer = () => {
  return (
    <footer className="py-16 bg-card border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="font-display text-2xl tracking-wider text-gradient-gold">
              ThePlugs
            </span>
            <p className="font-sans text-xs text-muted-foreground mt-2 tracking-wide">
              World-Class VIP Concierge
            </p>
          </div>

          <div className="flex gap-8">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors font-sans"
              >
                {link}
              </a>
            ))}
          </div>

          <p className="font-sans text-xs text-muted-foreground">
            © {new Date().getFullYear()} ThePlugs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
