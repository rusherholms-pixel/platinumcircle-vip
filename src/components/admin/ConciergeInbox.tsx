import { useState, useEffect, useRef } from "react";
import {
  Search, Send, Paperclip, Flag, MessageSquare, StickyNote,
  Circle, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface ConversationItem {
  id: string;
  member_id: string;
  status: string;
  is_priority: boolean;
  updated_at: string;
  member_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface MessageItem {
  id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  is_internal_note: boolean;
  is_read: boolean;
  created_at: string;
}

const PRIORITY_KEYWORDS = ["urgent", "tonight", "tomorrow", "emergency", "asap", "immediate"];

const STATUS_OPTIONS = [
  { value: "online", label: "Online", color: "bg-emerald-500" },
  { value: "away", label: "Away", color: "bg-amber-500" },
  { value: "offline", label: "Offline", color: "bg-muted-foreground/40" },
];

export default function ConciergeInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [conciergeStatus, setConciergeStatus] = useState("online");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchConciergeStatus();

    const channel = supabase
      .channel("admin-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchConversations();
        if (selectedId) fetchMessages(selectedId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConciergeStatus = async () => {
    const { data } = await supabase.from("concierge_status").select("status").eq("id", 1).single();
    if (data) setConciergeStatus(data.status);
  };

  const updateConciergeStatus = async (status: string) => {
    await supabase.from("concierge_status").update({ status }).eq("id", 1);
    setConciergeStatus(status);
    toast({ title: `Status set to ${status}` });
  };

  const fetchConversations = async () => {
    // Get conversations with last message info
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!convs) return;

    const items: ConversationItem[] = [];
    for (const c of convs) {
      // Get member profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", c.member_id)
        .single();

      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at, is_read, sender_id")
        .eq("conversation_id", c.id)
        .eq("is_internal_note", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Count unread from member
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .eq("is_read", false)
        .eq("is_internal_note", false)
        .neq("sender_id", user?.id || "");

      // Auto-detect priority keywords
      let autoPriority = c.is_priority;
      if (lastMsg?.content) {
        const lower = lastMsg.content.toLowerCase();
        if (PRIORITY_KEYWORDS.some((kw) => lower.includes(kw))) {
          autoPriority = true;
          if (!c.is_priority) {
            await supabase.from("conversations").update({ is_priority: true }).eq("id", c.id);
          }
        }
      }

      items.push({
        id: c.id,
        member_id: c.member_id,
        status: c.status,
        is_priority: autoPriority,
        updated_at: c.updated_at,
        member_name: profile?.full_name || "Member",
        last_message: lastMsg?.content || "No messages yet",
        last_message_at: lastMsg?.created_at || c.created_at,
        unread_count: count || 0,
      });
    }

    // Sort: priority first, then by last message time
    items.sort((a, b) => {
      if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
      if (a.unread_count !== b.unread_count) return b.unread_count - a.unread_count;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });

    setConversations(items);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data as MessageItem[]);
      // Mark member messages as read
      const unread = data.filter((m: any) => !m.is_read && m.sender_id !== user?.id).map((m: any) => m.id);
      if (unread.length) {
        await supabase.from("messages").update({ is_read: true }).in("id", unread);
      }
    }
  };

  const selectConversation = (convId: string) => {
    setSelectedId(convId);
    fetchMessages(convId);
    setShowNoteInput(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedId || !user || sending) return;
    setSending(true);

    const messageContent = input.trim();
    await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_id: user.id,
      content: messageContent,
    });

    // Create notification for member
    const conv = conversations.find((c) => c.id === selectedId);
    if (conv) {
      await supabase.from("notifications").insert({
        user_id: conv.member_id,
        title: "Your concierge has replied",
        body: messageContent.substring(0, 100),
        link: "/member/messages",
      });

      // Send email notification to member
      const { data: memberProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", conv.member_id)
        .single();

      if (memberProfile?.email) {
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "concierge-reply",
            recipientEmail: memberProfile.email,
            idempotencyKey: `concierge-reply-${selectedId}-${Date.now()}`,
            templateData: {
              memberName: memberProfile.full_name || undefined,
              messagePreview: messageContent.substring(0, 120),
            },
          },
        });
      }
    }

    setInput("");
    setSending(false);
  };

  const handleSendNote = async () => {
    if (!noteInput.trim() || !selectedId || !user) return;

    await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_id: user.id,
      content: noteInput.trim(),
      is_internal_note: true,
    });

    setNoteInput("");
    setShowNoteInput(false);
    toast({ title: "Internal note added" });
  };

  const togglePriority = async (convId: string, current: boolean) => {
    await supabase.from("conversations").update({ is_priority: !current }).eq("id", convId);
    fetchConversations();
  };

  const updateConvStatus = async (convId: string, status: string) => {
    await supabase.from("conversations").update({ status }).eq("id", convId);
    fetchConversations();
  };

  const filtered = conversations.filter((c) =>
    c.member_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-16rem)] border border-border rounded-lg overflow-hidden">
      {/* Left: Conversation list */}
      <div className="w-80 border-r border-border flex flex-col bg-card shrink-0">
        {/* Concierge status */}
        <div className="px-3 py-2 border-b border-border">
          <Select value={conciergeStatus} onValueChange={updateConciergeStatus}>
            <SelectTrigger className="h-8 text-xs bg-background border-border">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find((s) => s.value === conciergeStatus)?.color}`} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members…"
              className="h-8 pl-9 text-xs bg-background border-border"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">No conversations</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                  selectedId === c.id ? "bg-muted" : ""
                } ${c.unread_count > 0 ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {c.is_priority && <AlertTriangle size={12} className="text-primary" />}
                    <span className="text-sm font-medium text-foreground truncate">{c.member_name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.last_message}</p>
                  {c.unread_count > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[9px] h-4 px-1.5 ml-2">{c.unread_count}</Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Message thread */}
      <div className="flex-1 flex flex-col">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base text-foreground">{selected?.member_name}</h3>
                <Badge variant="outline" className="text-[9px] tracking-widest uppercase border-border">
                  {selected?.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => selected && togglePriority(selected.id, selected.is_priority)}
                  title="Toggle priority"
                >
                  <Flag size={14} className={selected?.is_priority ? "text-primary fill-primary" : "text-muted-foreground"} />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  title="Add internal note"
                >
                  <StickyNote size={14} className="text-muted-foreground" />
                </Button>
                <Select
                  value={selected?.status}
                  onValueChange={(v) => selected && updateConvStatus(selected.id, v)}
                >
                  <SelectTrigger className="h-7 text-[10px] w-28 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => {
                const isAdmin = msg.sender_id === user?.id;
                if (msg.is_internal_note) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 max-w-[80%]">
                        <p className="text-[10px] tracking-widest uppercase text-amber-500 mb-1 font-semibold">
                          Internal Note — Not visible to member
                        </p>
                        <p className="text-xs text-foreground">{msg.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isAdmin
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {msg.content && <p>{msg.content}</p>}
                      {msg.attachment_url && (
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs underline opacity-80">
                          <Paperclip size={10} />{msg.attachment_name || "Attachment"}
                        </a>
                      )}
                      <div className={`text-[10px] mt-1 ${isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {!isAdmin && msg.is_read && " · Read"}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Internal note input */}
            {showNoteInput && (
              <div className="px-4 py-2 border-t border-amber-500/20 bg-amber-500/5">
                <p className="text-[10px] tracking-widest uppercase text-amber-500 mb-1 font-semibold">
                  Internal Note — Not visible to member
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add an internal note…"
                    className="text-xs h-16 bg-background border-border resize-none"
                  />
                  <Button size="sm" onClick={handleSendNote} disabled={!noteInput.trim()} className="shrink-0">
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Reply input */}
            <div className="px-4 py-3 border-t border-border bg-card">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Reply to member…"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  disabled={sending}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || sending} className="bg-gradient-gold text-primary-foreground rounded-xl h-10 w-10 shrink-0">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
