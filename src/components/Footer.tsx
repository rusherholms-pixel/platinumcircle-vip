import logoEmblem from "@/assets/logo-emblem.svg";

const Footer = () => {
  return (
    <footer className="py-10 md:py-16 bg-card border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex items-center gap-3">
            <img src={logoEmblem} alt="Platinum Circle" className="h-10 w-10" />
            <div>
              <span className="font-display text-xl tracking-wider text-gradient-gold">
                Platinum Circle
              </span>
              <p className="font-sans text-xs text-muted-foreground mt-1 tracking-wide">
                World-Class VIP Concierge
              </p>
            </div>
          </div>

          <div className="flex gap-6 md:gap-8">
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
            © {new Date().getFullYear()} Platinum Circle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
