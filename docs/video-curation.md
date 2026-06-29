# Video Curation — Verification Pass (v2: substitutions + timestamps)

Project: **Power BI — First Report Path**
Updated: 2026-06-28
Scope: 24 cells (8 steps × 3 languages).

## What changed in v2

1. **Added a `start_timestamp` column** — the minute where the step's topic begins. Focused videos start at `0:00`; for course-style videos the relevant chapter minute is given (or `to_validate` where the publisher didn't expose chapters).
2. **Replaced every video that failed curation** with a focused, in-language, on-topic, recent video — all with verified YouTube IDs.
3. **Resolved all reuse.** The reused full course now appears in only one step, and the reused English tutorial in only one step.

## Substitutions made (6)

| Step | Lang | Old (failed) | New (verified) | Why |
| ---: | :--- | :----------- | :------------- | :-- |
| 3 | EN | `MikekdopYhE` (reused w/ step 1) | `zgYZ0c0xvTk` — "Power Query in 20 Minutes" (2024) | focused Power Query, removes reuse |
| 5 | PT | `EGgukRGLOK4` — Aula 1 (calc. columns, 2022) | `naCjJ2OWDBQ` — Aula 2 "Criando Medidas" (2023) | matches the step's **measures** exercise |
| 6 | PT | `7cUrsltJbEI` (reused course) | `cLwA7_hW8dA` — "Dashboard em 15 Minutos" (2024, 14:00) | focused cards + charts + map |
| 6 | ES | `X0D4zPeCPZ0` (2021) | `dw5R8y1XkYs` — "POWER BI 2024 … Informes desde 0" (2024) | current UI |
| 7 | PT | `iH9Qx9R315A` (2020) | `djYLACiDVcg` — "Crie Seu Primeiro Dashboard … 2026" (Oct 2025) | freshest first-dashboard build |
| 8 | PT | `7cUrsltJbEI` (reused course) | `eV7asHYOrHE` — "Compartilhar Relatório Power BI" (2023, upd 2025, 18:50) | focused publish/share |

The two Portuguese substitutes were confirmed straight from the publisher's page embed (`og:video`), so the IDs and durations are exact.

## Reuse — now resolved

- **`7cUrsltJbEI`** (Hashtag full course) was in steps 2, 6, 8. After replacing 6 and 8, it remains **only in step 2** (its early "Obter Dados" section is the import topic). Used once → fine.
- **`MikekdopYhE`** (Guy in a Cube) was in steps 1 and 3. After replacing step 3, it remains **only in step 1** (its intro covers "what is Power BI"). Used once → fine.

## Step 6 EN — now resolved

Evaluated, decided, closed. No clean *recent* English video that covers the **full** step 6 (cards + charts + tables + slicers) could be verified — YouTube watch pages rate-limit on fetch and search returns SEO blogs rather than video pages. Weighing the verified options on merit:

- **Primary (kept): `c7LrqSxjJQQ`** — Leila Gharani / Xelplus (2021). It's the most *complete* beginner build among verified options (cards, charts, tables, slicers, end-to-end) by a top-tier instructor. The only knock is 2021 UI, which is cosmetic — the drag-field-to-visual workflow hasn't changed.
- **Optional alternative: `8mQn7Dmr9fg`** — Access Analytic (2024, `is_primary=false`). Current UI, but covers only the new Card and Slicer visuals — narrower (no charts/tables). Use as a supplement, or swap in if you value current UI over completeness.

So step 6 EN is closed: keep Leila as primary, with the 2024 clip as an optional add-on. Completeness beat recency for a beginner step.

## Deep-link timestamps

- **Step 2 EN** `VaOhNqNtGGE` — import starts at `1:20`, so the URL uses `&t=80s`.
- **Step 4 EN** `4ePNrdxWtY0` — data modeling/relationships starts at `2:18`, so the URL uses `&t=138s`. The hands-on relationship build is at `11:50` if you prefer the practical start.

## Timestamps still to confirm manually

- **Step 2 PT** `7cUrsltJbEI` — the "Obter Dados" minute inside the course. A proposed replacement in the latest external curation pointed to the wrong YouTube ID, so it was not applied.
- **Step 7 ES** `YaiS6eWCFQQ` — the formatting/layout chapter inside the 2h course.

## Notes carried over from v1

- Views / likes / duration remain `to_validate` (YouTube blocks programmatic capture; durations filled where the publisher exposed them).
- Several picks are free but funnel to paid courses (Hashtag → paid course; Kevin Stratvert → Datacamp). Acceptable; prefer the least salesy option when two are equivalent.
- The replaced videos are kept in the CSV as `is_primary=false` fallback rows so nothing is lost.
