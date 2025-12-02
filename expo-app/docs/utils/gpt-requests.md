# GPT Requests

Helpers para acessar os endpoints do backend que intermediam chamadas à OpenAI.

Este arquivo documenta a API cliente localizada em `src/utils/gptRequests.ts` e traz exemplos, recomendações de uso e tratamento de erros.

## API (assinaturas)

- `generateItinerary(prompt: string): Promise<string>`
  - Envia `{ prompt }` para o endpoint e retorna `data.message` com o itinerário (texto).
- `generateChatAnswers(prompt: string): Promise<string>`
  - Envia `{ prompt }` e retorna `data.message` com a resposta do chat (texto).

> Observação: a forma exata do `data` retornado depende do backend; adapte os parsers caso o formato seja diferente (ex.: `data.result` ou `data.choices[0].text`).

## Exemplo de implementação (TypeScript)

Arquivo sugerido: `src/utils/gptRequests.ts`

```ts
import { API_URL } from "@config"; // ou './config'

type ApiResponse = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function postJson(path: string, body: object, signal?: AbortSignal) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  const data: ApiResponse = await res.json().catch(() => ({ ok: false, error: "invalid_json" }));

  if (!res.ok) {
    const errMsg = data?.error || `HTTP ${res.status}`;
    const error: any = new Error(errMsg);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function generateItinerary(prompt: string, signal?: AbortSignal): Promise<string> {
  const data = await postJson("/api/generateItinerary", { prompt }, signal);
  if (!data.message) throw new Error("Resposta inválida do servidor");
  return data.message;
}

export async function generateChatAnswers(prompt: string, signal?: AbortSignal): Promise<string> {
  const data = await postJson("/api/justchat", { prompt }, signal);
  if (!data.message) throw new Error("Resposta inválida do servidor");
  return data.message;
}
```

## Exemplo de uso

```ts
import { generateItinerary, generateChatAnswers } from "@utils/gptRequests";

async function run() {
  try {
    const itinerary = await generateItinerary("3 dias em Salvador focando em cultura e gastronomia");
    console.log(itinerary);

    const answer = await generateChatAnswers("Quais os melhores meses para visitar Floripa?");
    console.log(answer);
  } catch (err) {
    console.error("Erro na chamada GPT:", err);
  }
}
```

## Boas práticas e dicas

- centralize a URL da API em `src/config.ts` (exportar `API_URL`) e use-a em `gptRequests.ts`.
- trate `response.ok` e `data` com validação — não confie apenas no `res.json()`.
- HTTP 429: indique ao usuário que a cota foi atingida e ofereça retry exponencial ou uma mensagem amigável.
- timeouts: use `AbortController` para cancelar requisições longas (ex.: timeout em 15s).
- retries: em erros transientes (timeout, 502, 503), implemente retry com backoff.
- logs: registre `status` e `body` em ambiente de desenvolvimento para debug.
- CORS: se o backend estiver em domínio diferente, verifique as configurações CORS do servidor.

## Erros comuns e how-to debug

- URL inválida/hardcode: troque por `API_URL` — verifique `src/config.ts`.
- 429 (rate limit): exiba mensagem e desabilite ação temporariamente; registre para investigar.
- 500 / 502 / 503: retry com backoff e alertar manutenção.
- resposta sem `message`: confirme o contrato da API e ajuste o parser.