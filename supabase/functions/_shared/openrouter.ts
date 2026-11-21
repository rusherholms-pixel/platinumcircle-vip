// Shared OpenRouter client for Platinum Circle edge functions.
// Calls https://openrouter.ai/api/v1/chat/completions using the FREE-tier
// model. Reads the API key from the OPENROUTER_API_KEY project secret
// (set via the Supabase management API), falling back to LOVABLE_API_KEY
// if present, else a built-in default injected at deploy time.
//
// The default key in this file is replaced at deploy; prefer the secret.

export const OPENROUTER_MODEL = "particle-ai/particle-1:free";
// fallback id used if both OPENROUTER_API_KEY and LOVABLE_API_KEY are absent
export const OPENROUTER_FALLBACK_KEY = Deno.env.get("OPENROUTER_API_KEY")
  ?? Deno.env.get("LOVABLE_API_KEY")
  ?? "";

export async function openaiChat(params: {
  messages: Array<{ role: string; content: string }>;
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  temperature?: number;
  max_tokens?: number;
}): Promise<{ ok: boolean; status?: number; data?: unknown; error?: string }> {
  const key = OPENROUTER_FALLBACK_KEY;
  if (!key) {
    return { ok: false, error: "No OPENROUTER_API_KEY configured" };
  }
  const body: Record<string, unknown> = {
    model: OPENROUTER_MODEL,
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
  };
  if (params.tools?.length) body.tools = params.tools;
  if (params.tool_choice) body.tool_choice = params.tool_choice;
  if (params.response_format) body.response_format = params.response_format;
  if (params.max_tokens) body.max_tokens = params.max_tokens;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://platinumcircle.ca",
        "X-Title": "Platinum Circle",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, status: res.status, error: txt.slice(0, 300) };
    }
    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Safely pull the first assistant text out of an (unknown-shaped) chat-completions
// response. Returns "" when the shape is unexpected, so callers can fall back.
export function firstTextContent(data: unknown): string {
  if (typeof data !== "object" || data === null) return "";
  const choices = (data as { choices?: unknown[] }).choices;
  const msg = choices?.[0] as { message?: { content?: unknown } } | undefined;
  const content = msg?.message?.content;
  return typeof content === "string" ? content : "";
}
