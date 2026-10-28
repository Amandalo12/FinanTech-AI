import type { IconName } from "../components/Icons";

export interface Stage {
  id: string;
  title: string;
}

export interface Concept {
  id: string;
  title: string;
  short: string;
  icon: IconName;
  stage: string;
  prompt: string;
}

export const STAGES: Stage[] = [
  { id: "fundamentos", title: "Fundamentos" },
  { id: "investimentos", title: "Investimentos" },
  { id: "aprofundando", title: "Aprofundando" },
];

function ask(title: string, extra = ""): string {
  return `Quero aprender sobre ${title}. Explique do zero, para quem está começando.${extra ? " " + extra : ""}`;
}

/** A ordem desta lista é a trilha de estudo recomendada. */
export const CONCEPTS: Concept[] = [
  {
    id: "mercado",
    title: "Mercado financeiro",
    short: "Como o dinheiro circula entre quem poupa e quem precisa de crédito.",
    icon: "bank",
    stage: "fundamentos",
    prompt: ask("o mercado financeiro"),
  },
  {
    id: "ipca",
    title: "IPCA e inflação",
    short: "Entenda por que os preços aumentam.",
    icon: "trend",
    stage: "fundamentos",
    prompt: ask("IPCA e inflação", "Mostre como isso afeta o poder de compra no dia a dia."),
  },
  {
    id: "selic",
    title: "Taxa Selic",
    short: "Descubra como os juros influenciam a economia.",
    icon: "percent",
    stage: "fundamentos",
    prompt: ask("a taxa Selic e os juros", "Explique como ela influencia a economia e os investimentos."),
  },
  {
    id: "dolar",
    title: "Dólar e câmbio",
    short: "Compreenda as variações da moeda.",
    icon: "dollar",
    stage: "fundamentos",
    prompt: ask("dólar e câmbio", "Explique por que a cotação sobe e desce."),
  },
  {
    id: "pib",
    title: "PIB e crescimento",
    short: "Como medir o crescimento da economia de um país.",
    icon: "progress",
    stage: "fundamentos",
    prompt: ask("o PIB e o crescimento econômico"),
  },
  {
    id: "primeiros",
    title: "Primeiros investimentos",
    short: "Conheça os conceitos fundamentais antes de investir.",
    icon: "sprout",
    stage: "investimentos",
    prompt: ask(
      "os primeiros investimentos",
      "Explique os conceitos fundamentais que eu preciso conhecer antes de investir.",
    ),
  },
  {
    id: "renda",
    title: "Renda fixa e variável",
    short: "O que muda entre os dois grandes grupos de investimento.",
    icon: "layers",
    stage: "investimentos",
    prompt: ask("renda fixa e renda variável", "Compare as duas com exemplos simples."),
  },
  {
    id: "cdb",
    title: "CDB, Tesouro e CDI",
    short: "Títulos de renda fixa e a principal referência de juros.",
    icon: "cash",
    stage: "investimentos",
    prompt: ask("CDB, Tesouro Direto e CDI", "Explique a diferença entre eles."),
  },
  {
    id: "bolsa",
    title: "Bolsa de valores",
    short: "O que são ações e como funciona a bolsa.",
    icon: "candles",
    stage: "aprofundando",
    prompt: ask("a bolsa de valores e as ações"),
  },
  {
    id: "fundos",
    title: "Fundos de investimento",
    short: "Como funciona investir de forma coletiva.",
    icon: "pie",
    stage: "aprofundando",
    prompt: ask("fundos de investimento"),
  },
  {
    id: "riscos",
    title: "Riscos e diversificação",
    short: "Risco, liquidez e diversificação em linguagem simples.",
    icon: "shield",
    stage: "aprofundando",
    prompt: ask("riscos, liquidez e diversificação nos investimentos"),
  },
];

/** Cards iniciais da tela de início, na ordem exibida. */
export const STARTER_IDS = ["ipca", "selic", "dolar", "primeiros"];

export const SUGGESTED_QUESTIONS = [
  "O que é inflação e por que os preços sobem?",
  "Qual é a diferença entre Selic e CDI?",
  "Por que o dólar sobe e desce?",
  "Por onde começar a investir com pouco dinheiro?",
  "O que significa liquidez?",
];
