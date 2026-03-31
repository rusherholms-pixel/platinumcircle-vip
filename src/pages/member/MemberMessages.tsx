import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversation } from "@/hooks/useConversation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground/40",
};

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  away: "Away — slower response",
  offline: "We typically respond within a few hours",
};

export default function MemberMessages() {
  const { user } = useAuth();
  const { messages, loading, conciergeStatus, sendMessage, uploadAttachment } = useConversation();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (text.length > 2000) {
      toast({ title: "Message too long", description: "Maximum 2000 characters.", variant: "destructive" });
      return;
    }
    setSending(true);
    setInput("");
    const err = await sendMessage(text);
    if (err) toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Unsupported file", description: "Only PDF, JPG, PNG files are supported.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum 10MB per file.", variant: "destructive" });
      return;
    }

    setSending(true);
    const attachment = await uploadAttachment(file);
    if (attachment) {
      await sendMessage("", attachment);
    } else {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setSending(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Member";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
            <Sparkles size={18} className="text-primary-foreground" />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${STATUS_COLORS[conciergeStatus]}`} />
        </div>
        <div>
          <h2 className="font-display text-lg text-foreground">Your Concierge</h2>
          <p className="text-xs text-muted-foreground">{STATUS_LABELS[conciergeStatus]}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="mx-auto mb-4 text-primary" size={32} />
            <p className="text-muted-foreground text-sm">
              Welcome, {firstName}. How can we assist you today?
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {msg.content && <p>{msg.content}</p>}
                {msg.attachment_url && (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs underline opacity-80 hover:opacity-100"
                  >
                    <Paperclip size={12} />
                    {msg.attachment_name || "Attachment"}
                  </a>
                )}
                <div className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMe && msg.is_read && " · Read"}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-border mt-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <Paperclip size={18} />
          </Button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            maxLength={2000}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
            className="bg-gradient-gold text-primary-foreground rounded-xl h-10 w-10 shrink-0"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
