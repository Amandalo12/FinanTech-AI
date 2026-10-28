import { Composer } from "../components/Composer";
import { Hero } from "../components/Hero";
import { ProgressCard } from "../components/ProgressCard";
import { StatusBanner } from "../components/StatusBanner";
import { TopicCards } from "../components/TopicCards";
import { CONCEPTS, STARTER_IDS, SUGGESTED_QUESTIONS, type Concept } from "../data/concepts";
import type { Progress } from "../lib/progress";
import type { Tutor } from "../hooks/useTutor";
import type { ApiStatus } from "../types";

interface Props {
  tutor: Tutor;
  status: ApiStatus;
  canChat: boolean;
  progress: Progress;
  onRecheck: () => void;
  onStartConcept: (concept: Concept) => void;
  onAsk: (text: string) => boolean;
}

const STARTERS = STARTER_IDS.map((id) => CONCEPTS.find((c) => c.id === id)).filter(
  (c): c is Concept => Boolean(c),
);

export function HomeView({ tutor, status, canChat, progress, onRecheck, onStartConcept, onAsk }: Props) {
  return (
    <div className="page home">
      <Hero />
      <StatusBanner status={status} onRecheck={onRecheck} />
      <Composer onSubmit={onAsk} disabled={!canChat} loading={tutor.loading} />

      <div className="chips" aria-label="Sugestões de perguntas">
        {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
          <button key={q} type="button" className="chip" disabled={!canChat || tutor.loading} onClick={() => onAsk(q)}>
            {q}
          </button>
        ))}
      </div>

      <TopicCards
        title="Comece por um tema"
        concepts={STARTERS}
        studied={progress.studied}
        disabled={!canChat || tutor.loading}
        onSelect={onStartConcept}
      />

      <ProgressCard progress={progress} canStart={canChat && !tutor.loading} onStart={onStartConcept} />
    </div>
  );
}
