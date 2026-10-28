import { useId } from "react";
import { Icon } from "./Icons";
import type { Concept } from "../data/concepts";

interface Props {
  title?: string;
  concepts: Concept[];
  studied: Set<string>;
  disabled: boolean;
  onSelect: (concept: Concept) => void;
}

export function TopicCards({ title, concepts, studied, disabled, onSelect }: Props) {
  const headingId = useId();
  return (
    <section className="topics" aria-labelledby={title ? headingId : undefined}>
      {title && (
        <h2 id={headingId} className="section-title">
          {title}
        </h2>
      )}
      <div className="topic-grid">
        {concepts.map((c) => (
          <button
            key={c.id}
            type="button"
            className="topic-card glass"
            disabled={disabled}
            title={disabled ? "O professor está indisponível no momento" : undefined}
            onClick={() => onSelect(c)}
          >
            <span className="topic-icon">
              <Icon name={c.icon} size={22} />
            </span>
            <span className="topic-title">{c.title}</span>
            <span className="topic-desc">{c.short}</span>
            {studied.has(c.id) && (
              <span className="topic-done">
                <Icon name="check" size={14} /> Estudado
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
