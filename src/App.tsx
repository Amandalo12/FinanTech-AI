import { useCallback, useEffect, useMemo, useState } from "react";
import Background3D from "./components/Background3D";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import type { Concept } from "./data/concepts";
import { useHealth } from "./hooks/useHealth";
import { useTutor } from "./hooks/useTutor";
import { computeProgress } from "./lib/progress";
import type { View } from "./types";
import { HistoryView } from "./views/HistoryView";
import { HomeView } from "./views/HomeView";
import { LibraryView } from "./views/LibraryView";
import { ProgressView } from "./views/ProgressView";
import { TutorView } from "./views/TutorView";

const TITLES: Record<View, string> = {
  home: "Início",
  tutor: "Professor IA",
  library: "Biblioteca de conceitos",
  progress: "Meu progresso",
  history: "Histórico de conversas",
};

export default function App() {
  const [view, setView] = useState<View>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status, recheck } = useHealth();
  const tutor = useTutor();

  const canChat = status === "online";
  const progress = useMemo(() => computeProgress(tutor.items), [tutor.items]);

  const go = useCallback((next: View) => {
    setView(next);
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const ask = useCallback(
    (text: string): boolean => {
      if (!canChat) return false;
      const ok = tutor.send(text);
      if (ok) setView("tutor");
      return ok;
    },
    [canChat, tutor],
  );

  const startConcept = useCallback(
    (concept: Concept) => {
      if (!canChat) return;
      if (tutor.send(concept.prompt, { topicId: concept.id, title: concept.title })) setView("tutor");
    },
    [canChat, tutor],
  );

  const openConversation = useCallback(
    (id: string) => {
      tutor.open(id);
      go("tutor");
    },
    [tutor, go],
  );

  const isChat = view === "tutor";

  return (
    <>
      <Background3D />
      <div className="app">
        <Sidebar
          view={view}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onNavigate={go}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onCloseMobile={() => setMobileOpen(false)}
        />
        {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

        <div className="main">
          <Header title={TITLES[view]} status={status} onMenu={() => setMobileOpen(true)} />
          <main className={`content${isChat ? " is-chat" : ""}`} id="conteudo">
            {view === "home" && (
              <HomeView
                tutor={tutor}
                status={status}
                canChat={canChat}
                progress={progress}
                onRecheck={recheck}
                onStartConcept={startConcept}
                onAsk={ask}
              />
            )}
            {view === "tutor" && (
              <TutorView tutor={tutor} status={status} canChat={canChat} onRecheck={recheck} onAsk={ask} />
            )}
            {view === "library" && (
              <LibraryView
                status={status}
                canChat={canChat}
                loading={tutor.loading}
                progress={progress}
                onRecheck={recheck}
                onStartConcept={startConcept}
              />
            )}
            {view === "progress" && (
              <ProgressView progress={progress} canStart={canChat && !tutor.loading} onStartConcept={startConcept} />
            )}
            {view === "history" && <HistoryView tutor={tutor} onOpen={openConversation} />}
          </main>
        </div>
      </div>
    </>
  );
}
