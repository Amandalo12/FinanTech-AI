"""Back-end do FinanTech AI.

Expõe /api/health e /api/chat. A chave da API fica apenas no servidor
(variável de ambiente GROQ_API_KEY) e nunca é enviada ao navegador.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Annotated, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from groq import APIConnectionError, APIError, AuthenticationError, Groq, RateLimitError
from pydantic import BaseModel, Field, StringConstraints

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Confira os modelos disponíveis em console.groq.com e ajuste GROQ_MODEL se necessário.
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_TOKENS = 1600
MAX_HISTORY = 20  # últimas mensagens enviadas ao modelo

SYSTEM_PROMPT = """Você é o professor virtual do FinanTech AI, uma plataforma educacional sobre o mercado financeiro brasileiro para pessoas iniciantes.

TOM
- Didático, paciente, amigável, profissional e encorajador.
- Explique assuntos complexos de forma simples, sem infantilizar.
- Sempre explique termos técnicos (CDI, IPCA, Selic, liquidez, renda fixa etc.) na primeira vez que aparecerem.
- Incentive a curiosidade; perguntas básicas são sempre bem-vindas.
- Adapte a profundidade ao nível de conhecimento demonstrado pela pessoa.

FORMATO
- Responda sempre em português do Brasil.
- Para perguntas conceituais, prefira esta estrutura (omita itens que não fizerem sentido em respostas curtas):
  ### O que é
  ### Como funciona
  ### Exemplo prático (uma situação do cotidiano)
  ### Por que é importante
  ### Resumo (2 a 4 pontos para memorizar)
- Use apenas Markdown simples: títulos com ###, listas com - ou 1., e **negrito**. Não use tabelas, blocos de código nem HTML.
- Quando fizer sentido, termine sugerindo um assunto relacionado para continuar aprendendo.
- Responda sempre em português do Brasil.
- Para comparações ou perguntas conceituais, use APENAS listas com marcadores (-) ou numeração (1., 2.).
- NUNCA crie tabelas (|---|), blocos de código nem HTML.
- Use apenas Markdown simples: títulos com ###, listas com - ou 1., e **negrito**.

REGRAS DE CONTEÚDO
- Não invente dados econômicos. Você não tem acesso a dados em tempo real: para valores atuais (taxa Selic vigente, IPCA do mês, cotação do dólar, rentabilidades), diga isso com clareza e indique fontes oficiais, como Banco Central do Brasil, IBGE, Tesouro Nacional e B3.
- Nunca prometa ou sugira garantia de retorno. Lembre, quando relevante, que todo investimento envolve riscos e que rentabilidade passada não garante resultados futuros.
- Seu papel é educacional: não faça recomendações personalizadas de compra ou venda de ativos. Explique critérios e conceitos para que a pessoa decida com informação.
- Se a pergunta fugir de economia e finanças, redirecione com gentileza para o tema da plataforma.
"""

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: Text


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=100)


class ChatResponse(BaseModel):
    reply: str


_api_key = os.getenv("GROQ_API_KEY", "").strip()
client: Groq | None = Groq(api_key=_api_key, timeout=60.0, max_retries=2) if _api_key else None

app = FastAPI(title="FinanTech AI", docs_url="/api/docs", openapi_url="/api/openapi.json")


@app.get("/api/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "configured": client is not None,
        "model": MODEL if client is not None else None,
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="O professor de IA não está configurado no servidor. Defina GROQ_API_KEY.",
        )

    history = [m.model_dump() for m in req.messages][-MAX_HISTORY:]
    while history and history[0]["role"] != "user":
        history.pop(0)
    if not history or history[-1]["role"] != "user":
        raise HTTPException(status_code=400, detail="A última mensagem precisa ser do usuário.")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *history]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=MAX_TOKENS,
            temperature=0.4,
        )
    except AuthenticationError:
        raise HTTPException(
            status_code=502, detail="A chave de API configurada no servidor foi recusada."
        )
    except RateLimitError:
        raise HTTPException(
            status_code=429, detail="Muitas perguntas em pouco tempo. Aguarde um instante e tente de novo."
        )
    except APIConnectionError:
        raise HTTPException(
            status_code=502, detail="Não foi possível alcançar o serviço de IA. Tente novamente."
        )
    except APIError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Erro da Groq: {e.message if hasattr(e, 'message') else str(e)}",
        )
    except Exception as e:
        print("ERRO INESPERADO:", str(e))
        raise HTTPException(
            status_code=502,
            detail=f"Erro interno no servidor: {str(e)}",
        )

    reply = (response.choices[0].message.content or "").strip() if response.choices else ""
    if not reply:
        raise HTTPException(status_code=502, detail="O professor devolveu uma resposta vazia.")
    return ChatResponse(reply=reply)


# Em produção, serve o front-end compilado (npm run build gera ../dist).
DIST_DIR = BASE_DIR.parent / "dist"
if DIST_DIR.is_dir():
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="web")
