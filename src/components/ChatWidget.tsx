import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Minus, Crown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const EXCLUDED_PATHS = ["/admin", "/provider", "/member", "/auth", "/apply"];
const QUICK_REPLIES = [
  "Tell me about membership",
  "What services do you offer",
  "I have a specific request",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

const ChatWidget = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [closedThisSession, setClosedThisSession] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerFired = useRef(false);

  // Check if we should show the widget on this page
  const shouldShow = !user && !EXCLUDED_PATHS.some((p) => location.pathname.startsWith(p));

  // First-visit trigger: 30s delay for new visitors
  useEffect(() => {
    if (!shouldShow || triggerFired.current) return;

    const visited = localStorage.getItem("pc_visited");
    if (visited) return;

    const timer = setTimeout(() => {
      if (triggerFired.current) return;
      triggerFired.current = true;
      localStorage.setItem("pc_visited", "true");

      const greeting = getGreeting();
      const openingText = `Good ${greeting}.\n\nI noticed you exploring Platinum Circle — take all the time you need.\n\nIf you have any questions about our services or membership, I am here whenever you are ready.`;

      // Typewriter effect
      setIsOpen(true);
      setIsTyping(true);
      let idx = 0;
      const typeInterval = setInterval(() => {
        idx++;
        setTypingText(openingText.slice(0, idx));
        if (idx >= openingText.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: openingText,
            timestamp: new Date(),
          }]);
          setTypingText("");
        }
      }, 25);
    }, 30000);

    return () => clearTimeout(timer);
  }, [shouldShow]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setShowQuickReplies(false);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: msg,
          history: messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });

      const reply = error
        ? "I am sorry, I am having trouble connecting right now. Please try again shortly."
        : data?.reply ?? "Thank you for your message. A member of our team will follow up shortly.";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "I apologize for the inconvenience. Please try again in a moment.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setClosedThisSession(true);
  };

  const handleReopen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setClosedThisSession(false);
  };

  if (!shouldShow) return null;

  // Show small persistent icon after close
  if (closedThisSession && !isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={handleReopen}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-lg hover:border-primary/60 transition-colors group"
        title="Chat with Mia"
      >
        <Crown size={18} className="text-primary" />
      </motion.button>
    );
  }

  // Default floating trigger (before first visit trigger fires)
  if (!isOpen && !closedThisSession && messages.length === 0 && !triggerFired.current) {
    return null; // Widget not yet triggered
  }

  // Floating trigger for returning visitors
  if (!isOpen && !closedThisSession && messages.length === 0) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => {
          setIsOpen(true);
          if (messages.length === 0) {
            const greeting = getGreeting();
            setMessages([{
              id: "welcome",
              role: "assistant",
              content: `Good ${greeting}. Welcome to Platinum Circle. I am Mia, your personal concierge. What brings you to us today?`,
              timestamp: new Date(),
            }]);
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-gold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Open chat with Mia"
      >
        <MessageCircle size={28} />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[400px] flex flex-col rounded-2xl border border-primary/20 bg-[hsl(0,0%,7%)] shadow-2xl overflow-hidden"
          style={{ height: isMinimized ? "auto" : "520px", maxHeight: isMinimized ? "auto" : "calc(100vh - 4rem)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-card border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
                <Crown size={14} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-display text-sm text-foreground leading-tight">Mia</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Platinum Circle Concierge
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Minimize"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {/* Typewriter text (before messages are committed) */}
                {isTyping && typingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed bg-muted text-foreground whitespace-pre-line">
                      {typingText}
                      <span className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Quick replies */}
                {showQuickReplies && messages.length > 0 && !isTyping && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => sendMessage(qr)}
                        className="px-3 py-1.5 rounded-full border border-primary/20 text-xs text-primary hover:bg-primary/10 transition-colors"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border bg-card">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about membership, services, or anything else…"
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    disabled={isLoading || isTyping}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading || isTyping}
                    className="bg-gradient-gold text-primary-foreground rounded-xl h-10 w-10 shrink-0"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWidget;
