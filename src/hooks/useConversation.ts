import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  is_internal_note: boolean;
  is_read: boolean;
  created_at: string;
  sender_profile?: { full_name: string; avatar_url: string | null };
}

export interface Conversation {
  id: string;
  member_id: string;
  status: string;
  is_priority: boolean;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export function useConversation() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [conciergeStatus, setConciergeStatus] = useState<string>("online");

  // Fetch or create conversation
  const initConversation = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get existing conversation
    let { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("member_id", user.id)
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ member_id: user.id })
        .select()
        .single();
      conv = newConv;
    }

    if (conv) {
      setConversation(conv as Conversation);
      await fetchMessages(conv.id);
    }
    setLoading(false);
  }, [user]);

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data as Message[]);
      // Mark unread messages as read
      const unreadIds = data
        .filter((m: any) => !m.is_read && m.sender_id !== user?.id)
        .map((m: any) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ is_read: true }).in("id", unreadIds);
      }
    }
  };

  const sendMessage = async (content: string, attachmentData?: {
    url: string; name: string; type: string;
  }) => {
    if (!conversation || !user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: content || null,
      attachment_url: attachmentData?.url || null,
      attachment_name: attachmentData?.name || null,
      attachment_type: attachmentData?.type || null,
    });

    if (!error) {
      // Trigger email notification to concierge
      const memberName = user.user_metadata?.full_name || "Member";
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "new-member-message",
          recipientEmail: "slusere@yahoo.com",
          idempotencyKey: `msg-${conversation.id}-${Date.now()}`,
          templateData: {
            memberName,
            messageContent: content || "[Attachment]",
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return error;
  };

  const uploadAttachment = async (file: File) => {
    if (!user) return null;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("message-attachments")
      .upload(path, file);

    if (error) return null;

    const { data: signedUrl } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

    return signedUrl
      ? { url: signedUrl.signedUrl, name: file.name, type: file.type }
      : null;
  };

  // Fetch concierge status
  useEffect(() => {
    supabase
      .from("concierge_status")
      .select("status")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setConciergeStatus(data.status);
      });
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Auto mark as read if from concierge
          if (newMsg.sender_id !== user?.id && !newMsg.is_read) {
            supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, user]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  return {
    conversation,
    messages,
    loading,
    conciergeStatus,
    sendMessage,
    uploadAttachment,
    refreshMessages: () => conversation && fetchMessages(conversation.id),
  };
}
