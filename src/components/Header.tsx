import { Icon } from "./Icons";
import type { ApiStatus } from "../types";

interface Props {
  title: string;
  status: ApiStatus;
  onMenu: () => void;
}

const STATUS_LABEL: Record<ApiStatus, string> = {
  checking: "Verificando professor…",
  online: "Professor disponível",
  unconfigured: "IA não configurada",
  offline: "Servidor indisponível",
};

export function Header({ title, status, onMenu }: Props) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-btn"
        onClick={onMenu}
        aria-label="Abrir menu"
        aria-controls="sidebar"
      >
        <Icon name="menu" />
      </button>
      <div className="topbar-title">
        <h1>{title}</h1>
        <span className="ai-tag">Assistente educacional com IA</span>
      </div>
      <div className={`status status--${status}`} role="status">
        <span className="status-dot" aria-hidden="true" />
        {STATUS_LABEL[status]}
      </div>
    </header>
  );
}
