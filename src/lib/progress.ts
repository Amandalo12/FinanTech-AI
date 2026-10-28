import { CONCEPTS, STAGES } from "../data/concepts";
import type { Conversation } from "../types";

/** Um conceito conta como estudado quando uma conversa iniciada a partir dele recebeu resposta. */
export function computeProgress(items: Conversation[]) {
  const studied = new Set<string>();
  for (const c of items) {
    if (c.topicId && c.messages.some((m) => m.role === "assistant")) studied.add(c.topicId);
  }

  const total = CONCEPTS.length;
  const studiedCount = CONCEPTS.filter((c) => studied.has(c.id)).length;
  const stages = STAGES.map((stage) => {
    const concepts = CONCEPTS.filter((c) => c.stage === stage.id);
    return {
      ...stage,
      concepts,
      total: concepts.length,
      done: concepts.filter((c) => studied.has(c.id)).length,
    };
  });

  return {
    studied,
    studiedCount,
    total,
    percent: Math.round((studiedCount / total) * 100),
    stages,
    stagesDone: stages.filter((s) => s.done === s.total).length,
    next: CONCEPTS.find((c) => !studied.has(c.id)) ?? null,
    conversations: items.length,
    questions: items.reduce((n, c) => n + c.messages.filter((m) => m.role === "user").length, 0),
  };
}

export type Progress = ReturnType<typeof computeProgress>;
