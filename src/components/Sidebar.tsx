import { Icon, type IconName } from "./Icons";
import { Logo } from "./Logo";
import type { View } from "../types";

interface Props {
  view: View;
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: (view: View) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const ITEMS: { view: View; label: string; icon: IconName }[] = [
  { view: "home", label: "Início", icon: "home" },
  { view: "tutor", label: "Professor IA", icon: "tutor" },
  { view: "library", label: "Biblioteca de conceitos", icon: "library" },
  { view: "progress", label: "Meu progresso", icon: "progress" },
  { view: "history", label: "Histórico de conversas", icon: "history" },
];

const SOON: { label: string; icon: IconName }[] = [
  { label: "Trilhas de aprendizagem", icon: "path" },
  { label: "Configurações", icon: "settings" },
  { label: "Perfil do usuário", icon: "user" },
];

export function Sidebar({ view, collapsed, mobileOpen, onNavigate, onToggleCollapse, onCloseMobile }: Props) {
  return (
    <aside
      id="sidebar"
      className={`sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-open" : ""}`}
      aria-label="Barra lateral"
    >
      <div className="sidebar-brand">
        <Logo size={34} />
        <span className="brand-name nav-label">
          FinanTech <b>AI</b>
        </span>
        <button
          type="button"
          className="icon-btn collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
          aria-expanded={!collapsed}
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={18} />
        </button>
        <button type="button" className="icon-btn close-btn" onClick={onCloseMobile} aria-label="Fechar menu">
          <Icon name="chevronLeft" size={18} />
        </button>
      </div>

      <nav aria-label="Principal" className="sidebar-nav">
        {ITEMS.map((item) => (
          <button
            key={item.view}
            type="button"
            className={`nav-item${view === item.view ? " is-active" : ""}`}
            aria-current={view === item.view ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            onClick={() => onNavigate(item.view)}
          >
            <Icon name={item.icon} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-soon" aria-label="Em desenvolvimento">
        {SOON.map((item) => (
          <button
            key={item.label}
            type="button"
            className="nav-item is-soon"
            disabled
            title={`${item.label} (em breve)`}
          >
            <Icon name={item.icon} />
            <span className="nav-label">{item.label}</span>
            <span className="badge-soon nav-label">Em breve</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
