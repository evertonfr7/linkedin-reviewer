# LinkedIn Reviewer — Plano de Implementação

## Context

Construir o **Insight Architect**: um avaliador de perfis LinkedIn que recebe uma URL pública, raspa os dados com Playwright, analisa com `openai/gpt-4o-mini` via OpenRouter contra 10 critérios ponderados, e exibe um relatório de score 0-100 com recomendações priorizadas. MVP sem autenticação — resultado exibido na sessão sem persistência.

---

## Stack

- **Framework**: Next.js 15 (App Router)
- **Estilo**: Tailwind CSS (já definido no mockup HTML)
- **IA**: `openai/gpt-4o-mini` via [OpenRouter](https://openrouter.ai/api/v1) — API compatível com OpenAI SDK
- **Scraping**: Playwright (modo headless) — roda no servidor Next.js via API Route
- **Deploy**: Vercel (serverless, mas scraping requer Edge Runtime ou servidor externo)

> **Aviso de scraping**: LinkedIn bloqueia agressivamente scrapers. Estratégia: Playwright com user-agent real + rate limiting. Fallback MVP: campo de "cole o texto do perfil" se a URL falhar.

---

## Estrutura de Arquivos

```
linkedin-reviewer/
├── app/
│   ├── page.tsx                    # Landing page (porta o mockup HTML existente)
│   ├── analyze/
│   │   └── page.tsx                # Página de resultados (recebe dados via searchParams)
│   └── api/
│       └── analyze/
│           └── route.ts            # POST: scrape + analyze → JSON
├── components/
│   ├── UrlInput.tsx                # Input de URL + botão CTA
│   ├── ScoreGauge.tsx              # Gauge visual do score (0-100)
│   ├── CategoryCard.tsx            # Card de cada uma das 10 categorias
│   ├── RecommendationsList.tsx     # Lista priorizada de melhorias
│   └── ProfileSnapshot.tsx        # Nome, headline, foto do perfil raspado
├── lib/
│   ├── scraper.ts                  # Playwright: extrai campos do perfil LinkedIn
│   ├── analyzer.ts                 # OpenRouter API: envia perfil, recebe JSON de scores
│   └── criteria.ts                 # 10 critérios com pesos (fonte: docs/linkedin_avaliador_criterios.md)
├── types/
│   └── analysis.ts                 # Tipos TypeScript: ProfileData, AnalysisResult, CategoryScore
└── docs/                           # Documentação existente (não modificar)
```

---

## Critérios de Avaliação (lib/criteria.ts)

Extraídos do `docs/linkedin_avaliador_criterios.md`:

| # | Categoria | Peso |
|---|-----------|------|
| 1 | Foto e Banner | 8% |
| 2 | Headline/Título | 12% |
| 3 | Resumo/About | 14% |
| 4 | Experiência Profissional | 18% |
| 5 | Formação Acadêmica | 6% |
| 6 | Competências e Endorsements | 8% |
| 7 | Recomendações | 10% |
| 8 | Certificações e Cursos | 6% |
| 9 | Atividade e Engajamento | 10% |
| 10 | Elementos Complementares | 8% |

---

## Fluxo Principal

```
User → cola URL → POST /api/analyze
                       ↓
                  scraper.ts (Playwright)
                  extrai: nome, foto, headline, about,
                          experiências, formação, skills,
                          recomendações, certs, posts recentes
                       ↓
                  analyzer.ts (OpenRouter / gpt-4o-mini)
                  prompt: critérios + dados raspados
                  resposta: JSON { categories[], totalScore, recommendations[] }
                       ↓
                  redirect → /analyze?data=<encoded>
                       ↓
                  página de resultado renderiza ScoreGauge + CategoryCards
```

---

## Fases de Implementação

### Fase 1 — Setup do projeto
- `npx create-next-app@latest` com TypeScript + Tailwind
- Instalar dependências: `openai`, `playwright`
- Configurar `OPENROUTER_API_KEY` em `.env.local`

### Fase 2 — Critérios e tipos (lib/)
- `types/analysis.ts`: interfaces `ProfileData`, `CategoryScore`, `AnalysisResult`
- `lib/criteria.ts`: objeto com os 10 critérios, pesos e subcritérios detalhados
  - Extrair diretamente do `docs/linkedin_avaliador_criterios.md`

### Fase 3 — Scraper (lib/scraper.ts)
- Playwright headless, user-agent de browser real
- Campos a extrair do perfil público:
  - Foto de perfil presente (bool)
  - Banner customizado (bool)
  - Headline (texto)
  - About/Resumo (texto)
  - Lista de experiências (cargo, empresa, período, descrição)
  - Formação (curso, instituição)
  - Skills (lista)
  - Número de recomendações
  - Certificações (lista)
  - Posts recentes (contagem, último post há X dias)
  - URL customizada (bool)
- Timeout de 15s, retry 1x, erro claro se bloqueado

### Fase 4 — Analyzer (lib/analyzer.ts)
- Prompt estruturado enviando `ProfileData` como JSON
- Instrução para retornar JSON estrito com:
  ```json
  {
    "totalScore": 0-100,
    "grade": "All-Star|Advanced|Intermediate|Basic|Beginner",
    "categories": [
      { "name": "...", "score": 0-100, "maxScore": 100, "feedback": "..." }
    ],
    "topRecommendations": ["..."] // 3-5 ações priorizadas
  }
  ```
- Usar `openai/gpt-4o-mini` via OpenRouter (base URL: `https://openrouter.ai/api/v1`) com temperature 0
- Validar JSON retornado antes de passar ao frontend

### Fase 5 — API Route (app/api/analyze/route.ts)
- `POST /api/analyze` com `{ url: string }`
- Validação da URL (deve ser linkedin.com/in/...)
- Chama scraper → analyzer
- Retorna `AnalysisResult` ou erro com mensagem clara
- Rate limiting simples: 1 req/IP a cada 30s via `Map` em memória

### Fase 6 — Frontend
- **Landing page** (`app/page.tsx`): porta fiel do `docs/interface/stitch_screens/analysis_start.html`
  - `UrlInput.tsx` com validação client-side
  - Loading state com spinner enquanto analisa
- **Página de resultado** (`app/analyze/page.tsx`):
  - `ScoreGauge.tsx`: círculo com score + grade (All-Star, Advanced, etc.)
  - `CategoryCard.tsx`: grid das 10 categorias com barra de progresso + feedback
  - `RecommendationsList.tsx`: 3-5 ações priorizadas com ícones
  - Botão "Analisar outro perfil"

### Fase 7 — Tratamento de erros e fallback
- Se Playwright for bloqueado: exibir UI de fallback pedindo ao usuário para colar o texto do perfil (textarea)
- Mensagens de erro amigáveis: "Perfil privado", "LinkedIn bloqueou o acesso", etc.

---

## Arquivos Críticos

- `docs/linkedin_avaliador_criterios.md` — fonte de verdade para critérios (somente leitura)
- `docs/interface/stitch_screens/analysis_start.html` — mockup da landing page a ser portado
- `lib/criteria.ts` — critérios extraídos, referenciados pelo analyzer
- `lib/analyzer.ts` — prompt + parsing da resposta OpenRouter
- `app/api/analyze/route.ts` — ponto central de orquestração

---

## Variáveis de Ambiente

```env
OPENROUTER_API_KEY=sk-or-...
```

---

## Verificação (Como testar)

1. `npm run dev` → acessar `http://localhost:3000`
2. Colar URL de perfil LinkedIn público de teste
3. Verificar que `/api/analyze` retorna JSON válido com `totalScore` entre 0-100
4. Verificar que a página `/analyze` exibe score, 10 categorias e recomendações
5. Testar URL inválida → erro amigável exibido
6. Testar perfil privado → fallback exibido
