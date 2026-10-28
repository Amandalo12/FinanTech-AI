import { Icon } from "./Icons";
import type { Concept } from "../data/concepts";
import type { Progress } from "../lib/progress";

interface Props {
  progress: Progress;
  canStart: boolean;
  detailed?: boolean;
  onStart: (concept: Concept) => void;
}

export function ProgressCard({ progress, canStart, detailed, onStart }: Props) {
  const { studiedCount, total, percent, stagesDone, stages, next } = progress;

  return (
    <section className="progress glass" aria-label="Progresso de aprendizagem">
      <div className="progress-head">
        <h2 className="section-title">Seu progresso</h2>
        <span className="progress-percent">{percent}%</span>
      </div>

      <div
        className="bar"
        role="progressbar"
        aria-label="Conceitos estudados"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      <dl className="stats">
        <div>
          <dt>Conceitos estudados</dt>
          <dd>
            {studiedCount} de {total}
          </dd>
        </div>
        <div>
          <dt>Etapas concluídas</dt>
          <dd>
            {stagesDone} de {stages.length}
          </dd>
        </div>
        {detailed && (
          <>
            <div>
              <dt>Conversas</dt>
              <dd>{progress.conversations}</dd>
            </div>
            <div>
              <dt>Perguntas feitas</dt>
              <dd>{progress.questions}</dd>
            </div>
          </>
        )}
      </dl>

      {studiedCount === 0 && (
        <p className="muted">Você ainda não estudou nenhum conceito. Escolha um tema para começar.</p>
      )}

      {next ? (
        <div className="next">
          <div>
            <span className="muted">Próximo assunto recomendado</span>
            <strong>{next.title}</strong>
          </div>
          <button type="button" className="btn" disabled={!canStart} onClick={() => onStart(next)}>
            Estudar agora <Icon name="chevronRight" size={16} />
          </button>
        </div>
      ) : (
        <p className="next next--done">
          <Icon name="check" size={18} /> Você concluiu todos os conceitos da trilha.
        </p>
      )}
    </section>
  );
}
