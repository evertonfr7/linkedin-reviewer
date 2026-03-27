# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured yet.

## Environment Variables

```env
OPENROUTER_API_KEY=sk-or-...       # Required — OpenRouter API key
NEXT_PUBLIC_SITE_URL=...            # Optional — sent as HTTP-Referer to OpenRouter
```

## Architecture

**Insight Architect** — a LinkedIn profile evaluator that scores profiles 0–100 across 10 weighted categories using an LLM.

### Data flow

```
User Input (3 modes)
  ├── URL → POST /api/analyze → scraper.ts (Playwright) → ProfileData
  ├── Manual text paste → ManualInput.tsx → POST /api/analyze → parser.ts → ProfileData
  └── PDF upload → PdfUpload.tsx → POST /api/pdf (extract text) → POST /api/analyze → pdfParser.ts → ProfileData
                                                                                  ↓
                                                             analyzer.ts (OpenRouter / gpt-4o-mini)
                                                             sends ProfileData + 10 weighted criteria
                                                             returns JSON { totalScore, grade, categories[], topRecommendations[] }
                                                                                  ↓
                                                             router.push(`/analyze?data=<encoded JSON>`)
                                                                                  ↓
                                                             /analyze page renders ScoreGauge + CategoryCards + RecommendationsList
```

### Key files

| File | Purpose |
|------|---------|
| `src/lib/criteria.ts` | Source of truth for the 10 evaluation categories with weights and IDs |
| `src/lib/analyzer.ts` | Builds LLM prompt, calls OpenRouter, parses + validates JSON response with retry logic |
| `src/lib/scraper.ts` | Playwright headless scraper for public LinkedIn profiles |
| `src/lib/parser.ts` | Parses raw pasted profile text into `ProfileData` |
| `src/lib/pdfParser.ts` / `pdfExtractor.ts` | PDF → text → `ProfileData` pipeline |
| `src/types/analysis.ts` | All shared TypeScript types (`ProfileData`, `AnalysisResult`, `CategoryScore`, etc.) |
| `src/app/api/analyze/route.ts` | Main POST endpoint — orchestrates scrape/parse → analyze, includes in-memory IP rate limiting (5 req/min) |
| `src/app/api/pdf/route.ts` | PDF text extraction endpoint |
| `src/app/api/preview/route.ts` | Preview parse of pasted text before full analysis |

### LLM integration

- Model: `openai/gpt-4o-mini` via OpenRouter (`https://openrouter.ai/api/v1`)
- Uses the OpenAI SDK with a custom `baseURL`
- Temperature 0, max_tokens 2000
- Retries up to 3× with exponential backoff on 429/5xx/timeout errors
- Prompt instructs the model to return strict JSON; `parseLLMResponse()` strips markdown fences before parsing

### Scoring system

Defined in `docs/linkedin_avaliador_criterios.md` (read-only reference) and encoded in `src/lib/criteria.ts`:

| ID | Category | Weight |
|----|----------|--------|
| `photo-banner` | Foto e Banner | 8% |
| `headline` | Headline/Título | 12% |
| `about` | Resumo/About | 14% |
| `experience` | Experiência Profissional | 18% |
| `education` | Formação Acadêmica | 6% |
| `skills` | Competências | 8% |
| `recommendations` | Recomendações | 10% |
| `certifications` | Certificações | 6% |
| `activity` | Atividade e Engajamento | 10% |
| `complementary` | Elementos Complementares | 8% |

Grades: All-Star (90–100), Advanced (75–89), Intermediate (60–74), Basic (40–59), Beginner (0–39).

### Scraping fallback

LinkedIn aggressively blocks scrapers. When Playwright is blocked, `requiresManualInput: true` is returned in the API response and the UI switches to the manual text paste mode (`ManualInput.tsx`).

### Result page routing

Analysis results are passed as URL-encoded JSON in the `?data=` query param to `/analyze`. The `/score-overview` route appears to be an alternate results view.

## Docs (do not modify)

- `docs/linkedin_avaliador_criterios.md` — full criteria specification with subcriteria and scoring details
- `docs/implementation/plan.md` — original implementation plan
- `docs/interface/stitch_screens/` — HTML/PNG mockups for the landing page and score overview UI
