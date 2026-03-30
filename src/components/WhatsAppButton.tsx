import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "1234567890"; // Replace with actual concierge number
const DEFAULT_MESSAGE = "Hello, I'd like to learn more about your concierge services.";

const WhatsAppButton = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={28} fill="white" stroke="white" />
    </a>
  );
};

export default WhatsAppButton;
