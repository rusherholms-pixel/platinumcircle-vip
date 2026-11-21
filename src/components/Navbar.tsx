import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoEmblem from "@/assets/logo-emblem.svg";

const publicLinks = [
  { label: "Homes", href: "#services" },
  { label: "Drivers", href: "#services" },
  { label: "Experiences", href: "/experiences/bundles", isRoute: true },
  { label: "Security", href: "#services" },
  { label: "Join as Provider", href: "/apply", isRoute: true },
  { label: "Member Login", href: "/auth", isRoute: true },
];

const memberLinks = [
  { label: "Dashboard", href: "/member/dashboard" },
  { label: "Housing", href: "/member/housing" },
  { label: "Drivers", href: "/member/drivers" },
  { label: "Experiences", href: "/member/experiences" },
  { label: "My Bookings", href: "/member/bookings" },
  { label: "Messages", href: "/member/messages" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navLinks = user ? memberLinks : publicLinks;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Account";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={user ? "/member/dashboard" : "/"} className="flex items-center gap-3">
          <img src={logoEmblem} alt="Platinum Circle" className="h-10 w-10" />
          <span className="font-display text-xl tracking-wider text-gradient-gold hidden sm:inline">Platinum Circle</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            (link as any).isRoute || user ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-sans tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-sans tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </a>
            )
          )}

          {user ? (
            <Link
              to="/member/profile"
              className="ml-4 flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase font-semibold border border-primary/30 text-primary rounded-sm hover:border-primary/60 transition-colors"
            >
              <UserCircle size={16} />
              {firstName}
            </Link>
          ) : (
            <Link
              to="/apply"
              className="ml-4 px-6 py-2.5 text-xs tracking-widest uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
            >
              Join Now
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) =>
                (link as any).isRoute || user ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}

              {user ? (
                <Link
                  to="/member/profile"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-6 py-3 text-xs tracking-widest uppercase font-semibold border border-primary/30 text-primary rounded-sm text-center flex items-center justify-center gap-2"
                >
                  <UserCircle size={16} />
                  {firstName}
                </Link>
              ) : (
                <Link
                  to="/apply"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 px-6 py-3 text-xs tracking-widest uppercase font-semibold bg-gradient-gold text-primary-foreground rounded-sm text-center"
                >
                  Join Now
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
