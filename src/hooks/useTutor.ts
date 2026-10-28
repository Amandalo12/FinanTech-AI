import { useCallback, useEffect, useRef, useState } from "react";
import { sendChat } from "../lib/api";
import { uid } from "../lib/id";
import type { Conversation, Message } from "../types";

const STORAGE_KEY = "finantech.conversations.v1";
const MAX_STORED = 50;

function isMessage(v: unknown): v is Message {
  const m = v as Message;
  return !!m && typeof m.id === "string" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
}

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (c): c is Conversation =>
        !!c &&
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        Array.isArray(c.messages) &&
        c.messages.every(isMessage),
    );
  } catch {
    return [];
  }
}

function makeTitle(text: string): string {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > 60 ? `${s.slice(0, 57)}…` : s;
}

export function useTutor() {
  const [items, setItems] = useState<Conversation[]>(load);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED)));
    } catch {
      /* armazenamento cheio ou bloqueado: segue sem persistir */
    }
  }, [items]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const active = items.find((c) => c.id === activeId) ?? null;

  const request = useCallback(async (convId: string, history: Message[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const reply = await sendChat(
        history.map(({ role, content }) => ({ role, content })),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const message: Message = { id: uid(), role: "assistant", content: reply };
      setItems((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, updatedAt: Date.now(), messages: [...c.messages, message] } : c,
        ),
      );
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Algo deu errado. Tente novamente.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  const send = useCallback(
    (text: string, opts?: { topicId?: string; title?: string }): boolean => {
      const content = text.trim();
      if (!content || loading) return false;
      const userMessage: Message = { id: uid(), role: "user", content };
      const now = Date.now();

      if (active && !opts?.topicId) {
        const messages = [...active.messages, userMessage];
        setItems((prev) => prev.map((c) => (c.id === active.id ? { ...c, updatedAt: now, messages } : c)));
        void request(active.id, messages);
      } else {
        const conversation: Conversation = {
          id: uid(),
          title: opts?.title ?? makeTitle(content),
          topicId: opts?.topicId,
          createdAt: now,
          updatedAt: now,
          messages: [userMessage],
        };
        setItems((prev) => [conversation, ...prev]);
        setActiveId(conversation.id);
        void request(conversation.id, conversation.messages);
      }
      return true;
    },
    [active, loading, request],
  );

  const retry = useCallback(() => {
    if (!active || loading) return;
    if (active.messages[active.messages.length - 1]?.role !== "user") return;
    void request(active.id, active.messages);
  }, [active, loading, request]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setError(null);
  }, []);

  const newChat = useCallback(() => {
    stop();
    setActiveId(null);
  }, [stop]);

  const open = useCallback(
    (id: string) => {
      stop();
      setActiveId(id);
    },
    [stop],
  );

  const remove = useCallback(
    (id: string) => {
      if (id === activeId) {
        stop();
        setActiveId(null);
      }
      setItems((prev) => prev.filter((c) => c.id !== id));
    },
    [activeId, stop],
  );

  return { items, active, loading, error, send, retry, newChat, open, remove };
}

export type Tutor = ReturnType<typeof useTutor>;
