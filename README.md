# FinanTech AI

Professor virtual com IA que ensina mercado financeiro para iniciantes, com visual "Fintech Futurista Premium" e fundo 3D.

- **Front-end:** React 18 + TypeScript + Vite, fundo 3D em Three.js, CSS próprio.
- **Back-end:** Python + FastAPI. A chave da API fica só no servidor.
- **Dados:** conversas e progresso ficam no `localStorage` do navegador.

## Como rodar (desenvolvimento)

Terminal 1, back-end:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edite e preencha GROQ_API_KEY
uvicorn main:app --port 8000
```

Terminal 2, front-end:

```bash
npm install
npm run dev                 # http://localhost:5173 (as chamadas /api vão para a porta 8000)
```

Sem `GROQ_API_KEY`, o app abre normalmente, mas o professor aparece como "IA não configurada" e o chat fica desabilitado. Não há respostas simuladas.

## Produção

```bash
npm run build               # gera dist/
cd backend && uvicorn main:app --port 8000
```

Se a pasta `dist/` existir, o FastAPI serve o front-end e a API no mesmo endereço.

## Estrutura

```
backend/main.py          API (/api/health, /api/chat) e prompt do professor
src/components/          Sidebar, Header, Hero, Composer, MessageList, cards, fundo 3D
src/views/               Início, Professor IA, Biblioteca, Progresso, Histórico
src/hooks/               useTutor (conversas + IA), useHealth (status da API)
src/lib/                 cliente da API, Markdown seguro, cálculo de progresso
src/data/concepts.ts     conceitos, trilha e perguntas sugeridas
```

## Detalhes importantes

- **Progresso real:** um conceito conta como estudado quando uma conversa iniciada por ele (cards ou Biblioteca) recebe resposta. Tudo é calculado do histórico salvo.
- **Em breve:** Trilhas de aprendizagem, Configurações e Perfil aparecem desabilitados e marcados como "Em breve".
- **Fundo 3D:** versão reduzida em aparelhos modestos; com "movimento reduzido" no sistema, renderiza um único quadro; se o WebGL falhar, usa um fundo em CSS.
- **Dados econômicos:** o professor é instruído a não inventar valores atuais (Selic, IPCA, dólar) e a indicar fontes oficiais.
- Modelo configurável em `backend/.env` (`GROQ_MODEL`).
