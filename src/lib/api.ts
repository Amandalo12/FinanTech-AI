
import type { ChatTurn, Health } from "../types";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/+$/, "");

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function fetchHealth(
  signal?: AbortSignal,
): Promise<Health> {
  const res = await fetch(apiUrl("/api/health"), { signal });

  if (!res.ok) {
    throw new Error("health");
  }

  const data = await res.json();

  return {
    configured: Boolean(data.configured),
    model:
      typeof data.model === "string"
        ? data.model
        : undefined,
  };
}

export async function sendChat(
  messages: ChatTurn[],
  signal?: AbortSignal,
): Promise<string> {
  let res: Response;

  try {
    res = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;

    throw new Error(
      "Não foi possível conectar ao servidor. Verifique a conexão com o back-end.",
    );
  }

  if (!res.ok) {
    let detail = "";

    try {
      const body = await res.json();

      if (typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // Resposta sem JSON.
    }

    throw new Error(
      detail || `O servidor respondeu com erro (${res.status}).`,
    );
  }

  const data = await res.json();

  if (
    typeof data.reply !== "string" ||
    !data.reply.trim()
  ) {
    throw new Error(
      "O professor devolveu uma resposta vazia. Tente novamente.",
    );
  }

  return data.reply;
}
