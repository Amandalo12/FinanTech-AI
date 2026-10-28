import { Icon } from "../components/Icons";
import type { Tutor } from "../hooks/useTutor";

interface Props {
  tutor: Tutor;
  onOpen: (id: string) => void;
}

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function HistoryView({ tutor, onOpen }: Props) {
  const list = [...tutor.items].sort((a, b) => b.updatedAt - a.updatedAt);

  if (list.length === 0) {
    return (
      <div className="page">
        <div className="empty-card glass">
          <h2>Nenhuma conversa ainda</h2>
          <p>Suas conversas com o professor ficam salvas aqui, neste navegador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <ul className="history-list">
        {list.map((c) => (
          <li key={c.id} className="glass history-item">
            <button type="button" className="history-open" onClick={() => onOpen(c.id)}>
              <span className="history-title">{c.title}</span>
              <span className="muted">
                {dateFormat.format(c.updatedAt)} · {c.messages.length}{" "}
                {c.messages.length === 1 ? "mensagem" : "mensagens"}
              </span>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Excluir conversa: ${c.title}`}
              onClick={() => {
                if (window.confirm("Excluir esta conversa? Essa ação não pode ser desfeita.")) tutor.remove(c.id);
              }}
            >
              <Icon name="trash" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
