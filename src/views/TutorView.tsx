import { Composer } from "../components/Composer";
import { Icon } from "../components/Icons";
import { MessageList } from "../components/MessageList";
import { StatusBanner } from "../components/StatusBanner";
import { SUGGESTED_QUESTIONS } from "../data/concepts";
import type { Tutor } from "../hooks/useTutor";
import type { ApiStatus } from "../types";

interface Props {
  tutor: Tutor;
  status: ApiStatus;
  canChat: boolean;
  onRecheck: () => void;
  onAsk: (text: string) => boolean;
}

export function TutorView({ tutor, status, canChat, onRecheck, onAsk }: Props) {
  const { active } = tutor;

  return (
    <div className="chat-view">
      <div className="chat-toolbar">
        <p className="chat-title">{active ? active.title : "Nova conversa"}</p>
        <button type="button" className="btn btn--ghost" onClick={tutor.newChat} disabled={!active}>
          <Icon name="plus" size={16} /> Nova conversa
        </button>
      </div>

      {active ? (
        <MessageList
          messages={active.messages}
          loading={tutor.loading}
          error={tutor.error}
          onRetry={tutor.retry}
        />
      ) : (
        <div className="messages empty">
          <div className="empty-card glass">
            <h2>Olá! Sou seu professor de mercado financeiro.</h2>
            <p>
              Pergunte do seu jeito, sem medo de parecer básico. Eu explico com exemplos do dia a dia e termos
              traduzidos.
            </p>
            <div className="chips chips--left">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} type="button" className="chip" disabled={!canChat || tutor.loading} onClick={() => onAsk(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="chat-footer">
        <StatusBanner status={status} onRecheck={onRecheck} />
        <Composer onSubmit={onAsk} disabled={!canChat} loading={tutor.loading} autoFocus />
      </div>
    </div>
  );
}
