# Demo Scope

## Demo Contract

Sano demonstrates:

- restaurant discovery
- inspection transparency
- derived inspection-history indicators
- methodology and limitations
- a stable API contract
- a committed official-data seed generated from NYC DOHMH inspection records

Sano does not claim:

- real-time DOHMH synchronization
- comprehensive restaurant coverage
- absolute restaurant safety
- official consumer ratings or reviews
- illness causation or future-risk prediction

## 3–5 Minute Demo Path

1. Open the deployed app and state the thesis:
   “Sano turns public NYC restaurant inspection history into consumer-friendly
   context without pretending it is a safety verdict.”
2. Show the search page and point out that cards come from a curated offline NYC
   DOHMH extract, not Yelp-style reviews.
3. Search or select one official restaurant card.
4. Open the profile page and explain three signals:
   - current official grade;
   - inspection timeline and raw inspection scores;
   - Sano-derived trajectory, confidence, and reliability context.
5. Point to unavailable public rating, review, and trust-gap fields:
   “The official inspection source does not include popularity metadata, so Sano
   does not invent it. Google Places enrichment is the planned provider for
   sourced ratings and review counts.”
6. Open Methodology and call out limitations:
   curated offline extract, not live sync, not comprehensive coverage, not an
   official NYC rating, no safety or illness prediction.
7. Optional engineering proof:
   open `/api/health` and confirm `mode = official-generated-seed`.
8. Optional API proof:
   open `/api/restaurants` and point out that unavailable rating, review,
   price, and trust-gap fields are returned as `null` with explicit metadata
   availability flags.

## Recommended Showcase

Primary path:

- `Lucky Chix` — `/restaurants/50169790`
- Why: current A grade, four inspection cycles, medium confidence, and enough
  timeline movement to explain why inspection history adds context without
  turning the demo punitive.

Backup path:

- `Cutwater Cocktail Bar` — `/restaurants/50006959`
- Why: stable derived signal, medium confidence, and a calm comparison story if
  the room needs a less volatile example.

Avoid framing any restaurant as “safe” or “unsafe.” Good demo language:

> “This profile shows how a single current grade can sit beside a longer
> inspection timeline. Sano summarizes the pattern, but the official record and
> limitations stay visible.”

## Final Acceptance Commands

Run locally before demo:

```bash
npm run check
SANO_BASE_URL=http://127.0.0.1:3000 npm run acceptance
```

Run against production after deploy:

```bash
SANO_BASE_URL=https://sano-nine.vercel.app npm run acceptance
```
