import { Icon } from "../components/Icons";
import { ProgressCard } from "../components/ProgressCard";
import type { Concept } from "../data/concepts";
import type { Progress } from "../lib/progress";

interface Props {
  progress: Progress;
  canStart: boolean;
  onStartConcept: (concept: Concept) => void;
}

export function ProgressView({ progress, canStart, onStartConcept }: Props) {
  return (
    <div className="page">
      <ProgressCard progress={progress} canStart={canStart} detailed onStart={onStartConcept} />

      <section className="stage-list" aria-label="Etapas da trilha">
        {progress.stages.map((stage) => (
          <div key={stage.id} className="glass stage">
            <h3>
              {stage.title}{" "}
              <span className="muted">
                {stage.done}/{stage.total}
              </span>
            </h3>
            <ul>
              {stage.concepts.map((c) => {
                const done = progress.studied.has(c.id);
                return (
                  <li key={c.id} className={done ? "is-done" : ""}>
                    <span className="tick" aria-hidden="true">
                      {done && <Icon name="check" size={14} />}
                    </span>
                    {c.title}
                    <span className="sr-only">{done ? " (estudado)" : " (pendente)"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <p className="muted note">
        Um conceito conta como estudado quando você inicia uma conversa por ele (cards ou biblioteca) e o professor
        responde. Os números vêm do histórico salvo neste navegador; apagar conversas altera o progresso.
      </p>
    </div>
  );
}
