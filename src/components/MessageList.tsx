import { useEffect, useRef } from "react";
import { Icon } from "./Icons";
import { Logo } from "./Logo";
import { Markdown } from "../lib/markdown";
import type { Message } from "../types";

interface Props {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function MessageList({ messages, loading, error, onRetry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastIsUser = messages[messages.length - 1]?.role === "user";
  const showRetry = !loading && lastIsUser;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, loading, error]);

  return (
    <div className="messages" ref={containerRef} role="log" aria-live="polite" aria-label="Conversa com o professor">
      {messages.map((m) => (
        <article key={m.id} className={`msg msg--${m.role}`}>
          {m.role === "assistant" && (
            <div className="avatar" aria-hidden="true">
              <Logo size={22} />
            </div>
          )}
          <div className="bubble">
            <span className="sr-only">{m.role === "user" ? "Você disse:" : "Professor disse:"}</span>
            {m.role === "assistant" ? <Markdown text={m.content} /> : <p>{m.content}</p>}
          </div>
        </article>
      ))}

      {loading && (
        <div className="msg msg--assistant">
          <div className="avatar" aria-hidden="true">
            <Logo size={22} />
          </div>
          <div className="bubble typing">
            <span className="sr-only">O professor está escrevendo…</span>
            <i />
            <i />
            <i />
          </div>
        </div>
      )}

      {showRetry && (
        <div className="notice notice--error" role="alert">
          <Icon name="alert" />
          <div>
            <strong>Não foi possível obter a resposta.</strong>
            <p>{error ?? "A resposta não foi concluída."}</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onRetry}>
            <Icon name="refresh" size={16} /> Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
