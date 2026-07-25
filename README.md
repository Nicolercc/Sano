# Sano

Sano is a restaurant discovery and inspection-history interpretation app.

We are not building "a restaurant app." We are building one polished proof that inspection history contains useful context hidden by public grades.

Sano helps diners compare restaurants that may look similar on the surface:
familiar cuisines, convenient locations, and current public grades. The product
reveals inspection-history context underneath those compressed signals:
trajectory, volatility, repeat patterns, recent critical flags, and confidence
in the prepared data.

## One-Line Promise

Sano turns public restaurant inspection history into clear comparison context,
so diners see what a single posted grade compresses away.

## What This MVP Proves

The one-week MVP should prove that:

1. Public restaurant grades are useful but compressed.
2. Two restaurants with the same current grade can have very different inspection histories.
3. A timeline and plain-English explanation can make that history understandable quickly.
4. A polished consumer UX can present inspection context without fear-based claims.

## Target Users

### Everyday Diner

Someone choosing where to eat soon. They care about rating, distance, cuisine, price, and convenience, but they also want quick context when two options look similar.

### Cautious Diner Or Caregiver

Someone choosing for children, elderly people, pregnant people, immunocompromised people, or anyone with a lower risk tolerance. They want a higher trust threshold without having to read raw government datasets.

## What We Are Building This Week

The MVP is a polished demo of the core Sano experience:

- Search, map, and restaurant list
- Restaurant cards with Sano labels
- Restaurant profile page
- Inspection timeline visualization
- Inspection Reliability Score
- Trust Gap indicator only when popularity metadata exists
- Alternatives with stronger inspection trajectories
- Methodology and limitations page
- Clearly disclosed curated official seed generated from NYC DOHMH inspection
  records, with synthetic fallback for failure containment
- Google Places-ready enrichment layer for sourced rating and review-count
  metadata when an API key and reviewed matches are available
- Supabase-ready scale layer that can serve a larger app-ready restaurant set
  while falling back to committed JSON for demo reliability

## What We Are Not Building This Week

- User accounts
- Saved lists
- Restaurant owner dashboard
- Payments
- Machine learning
- Review scraping
- Nationwide coverage
- Illness, causation, or absolute safety claims

## Recommended Stack

- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- UI: custom components with shadcn/ui-style patterns where helpful
- Map: MapLibre GL JS or React MapLibre
- Visualization: React + SVG and/or Recharts
- Database: Supabase Postgres with PostGIS
- Data scripts: Python
- Deployment: Vercel
- Source control: GitHub pull requests

## Expected Repository Structure

```txt
sano/
  app/
    page.tsx
    restaurants/[id]/page.tsx
    methodology/page.tsx
    api/
  components/
    SearchShell.tsx
    FilterBar.tsx
    MapResults.tsx
    RestaurantCard.tsx
    RestaurantProfile.tsx
    TrustTimeline.tsx
    SanoScorePanel.tsx
    Alternatives.tsx
    MethodologyPanel.tsx
  lib/
    scoring.ts
    mock-data.ts
    types.ts
    format.ts
  data/
    sample-restaurants.json
  scripts/
    ingest_nyc_dohmh.py
    score_restaurants.py
  docs/
    PRD.md
    ARCHITECTURE.md
    CONTRIBUTING.md
    DATA_PLAN.md
    SPRINT_PLAN.md
    TEAM_OPERATING_MODEL.md
    QUALITY_CHECKLIST.md
    LLM_GUIDE.md
    TASK_BREAKDOWN.md
    AGENT_ORCHESTRATION.md
```

## Documentation Map

- [Product Requirements](docs/PRD.md): what the product is and what must ship.
- [Architecture](docs/ARCHITECTURE.md): how the app, data, and scoring fit together.
- [Sprint Plan](docs/SPRINT_PLAN.md): seven-day execution plan for three contributors.
- [Team Operating Model](docs/TEAM_OPERATING_MODEL.md): ownership, branch rules, and conflict avoidance.
- [Contributing](docs/CONTRIBUTING.md): Git workflow, PR expectations, and coding rules.
- [Data Plan](docs/DATA_PLAN.md): official data sources, seed strategy, and Supabase plan.
- [Task Breakdown](docs/TASK_BREAKDOWN.md): assignable work for the three-person team.
- [Quality Checklist](docs/QUALITY_CHECKLIST.md): final acceptance criteria.
- [LLM Guide](docs/LLM_GUIDE.md): how contributors should use AI tools without breaking scope.
- [Agent Orchestration](docs/AGENT_ORCHESTRATION.md): how to coordinate Codex, Cursor, and Claude.

## Team Principle

When uncertain, choose the option that makes the demo clearer, the code easier to review, and the product claim more defensible.
