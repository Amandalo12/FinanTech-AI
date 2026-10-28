import { StatusBanner } from "../components/StatusBanner";
import { TopicCards } from "../components/TopicCards";
import type { Concept } from "../data/concepts";
import type { Progress } from "../lib/progress";
import type { ApiStatus } from "../types";

interface Props {
  status: ApiStatus;
  canChat: boolean;
  loading: boolean;
  progress: Progress;
  onRecheck: () => void;
  onStartConcept: (concept: Concept) => void;
}

export function LibraryView({ status, canChat, loading, progress, onRecheck, onStartConcept }: Props) {
  return (
    <div className="page">
      <p className="lead">
        Escolha um conceito para uma aula guiada com o professor. A trilha segue uma ordem sugerida, mas você pode
        estudar na ordem que preferir.
      </p>
      <StatusBanner status={status} onRecheck={onRecheck} />
      {progress.stages.map((stage) => (
        <TopicCards
          key={stage.id}
          title={`${stage.title} · ${stage.done}/${stage.total}`}
          concepts={stage.concepts}
          studied={progress.studied}
          disabled={!canChat || loading}
          onSelect={onStartConcept}
        />
      ))}
    </div>
  );
}
