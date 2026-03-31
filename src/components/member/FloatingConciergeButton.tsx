import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FloatingConciergeButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/member/messages")}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-gold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-xs tracking-widest uppercase font-semibold"
      aria-label="Contact Concierge"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">Contact Concierge</span>
    </button>
  );
}
