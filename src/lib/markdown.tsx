import { type ReactNode } from "react";

interface ListState {
  ordered: boolean;
  items: string[];
}

function inline(text: string, keyBase: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyBase}-${i++}`;
    parts.push(
      token.startsWith("**") ? (
        <strong key={key}>{token.slice(2, -2)}</strong>
      ) : (
        <code key={key}>{token.slice(1, -1)}</code>
      ),
    );
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Renderizador de Markdown simples e seguro (sem HTML bruto). */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const state = { list: null as ListState | null, para: [] as string[] };

  const flushPara = () => {
    if (!state.para.length) return;
    const key = `p${blocks.length}`;
    blocks.push(<p key={key}>{inline(state.para.join(" "), key)}</p>);
    state.para = [];
  };
  const flushList = () => {
    const list = state.list;
    if (!list) return;
    const key = `l${blocks.length}`;
    const items = list.items.map((item, i) => <li key={i}>{inline(item, `${key}-${i}`)}</li>);
    blocks.push(list.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
    state.list = null;
  };

  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      const key = `h${blocks.length}`;
      blocks.push(<h4 key={key}>{inline(heading[1], key)}</h4>);
      continue;
    }
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const match = bullet ?? numbered;
    if (match) {
      flushPara();
      const ordered = !bullet;
      if (state.list && state.list.ordered !== ordered) flushList();
      if (!state.list) state.list = { ordered, items: [] };
      state.list.items.push(match[1]);
      continue;
    }
    flushList();
    state.para.push(line.trim());
  }
  flushPara();
  flushList();

  return <div className="md">{blocks}</div>;
}
