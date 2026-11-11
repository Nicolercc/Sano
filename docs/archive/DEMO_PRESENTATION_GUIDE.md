# Sano Application Demo And Presentation Guide

## Executive Summary

Sano is a restaurant discovery and inspection-history interpretation app for NYC restaurant records. It helps diners see what a single posted grade compresses away: inspection trajectory, history depth, recent critical flags, repeat patterns, and the limits of the available data.

The product is deliberately careful. Sano does not say whether a restaurant is safe or unsafe. It does not replace official NYC grades. It translates public inspection history into plain-language context that helps people compare restaurants more thoughtfully.

The simplest demo message is:

> The grade is on the door. Sano shows the story behind it.

## What The App Is

Sano is a polished MVP built to prove that public restaurant inspection records can become useful consumer context when they are placed inside a familiar discovery experience.

The application lets a user:

1. Search restaurants by name, cuisine, borough, address, or ZIP code.
2. Filter by cuisine, trajectory, confidence, or recent critical flags.
3. Compare restaurants in a list and coverage snapshot.
4. Open a restaurant profile.
5. Read an inspection timeline across multiple inspection cycles.
6. See Sano-derived labels such as "Consistent record," "Volatile history," "Recent critical flag," "Improving record," or "Limited data."
7. Read methodology and limitations in plain language.

## What The App Is Not

Sano is not:

1. An official NYC rating.
2. A live real-time inspection feed.
3. A safety verdict.
4. A medical or illness-risk predictor.
5. A review scraper.
6. A restaurant owner dashboard.
7. A nationwide restaurant database.

Use this wording in the demo:

> Sano is context from public inspection history, not a safety verdict.

Avoid this wording:

1. "This restaurant is safe."
2. "This restaurant is unsafe."
3. "This predicts whether someone will get sick."
4. "This is better than the official grade."
5. "This is a complete citywide record."

## Product Thesis

Restaurant grades are useful, but compressed. Two restaurants can show the same current grade while having very different inspection histories underneath.

Sano makes that hidden pattern legible:

1. A current grade stays visible.
2. Inspection history is summarized without replacing the official grade.
3. Derived signals are explained in plain language.
4. Missing data stays visible instead of being filled with guesses.

The product's value is not "more judgment." The value is better context.

## Target Users

### Everyday Diner

An everyday diner wants to choose where to eat soon. They care about convenience, cuisine, location, rating, and price, but they may want additional context when several options look similar.

Sano helps this user by making inspection history scannable without sending them into raw government data.

### Cautious Diner Or Caregiver

A cautious diner or caregiver may be choosing for children, older adults, pregnant people, immunocompromised people, or anyone with a lower risk tolerance.

Sano helps this user by showing history depth, repeat patterns, recent flags, and confidence without using fear-based language.

## Current Demo Scope

The current app uses a curated offline official seed generated from NYC DOHMH Restaurant Inspection Results.

Safe facts for the demo:

1. Current data mode: `official-generated-seed`.
2. Official source: NYC DOHMH Restaurant Inspection Results.
3. Extract generated from a 50,000-row API pull.
4. Normalized source contained 11,460 restaurant records.
5. Demo seed contains 16 curated restaurant records.
6. Demo seed contains 57 inspection cycles.
7. Demo seed spans 13 cuisine labels.
8. Demo seed includes records across Bronx, Brooklyn, Manhattan, and Queens.
9. Demo extract date: July 25, 2026.
10. The committed synthetic seed exists only as a fallback for failure containment.

Say this carefully:

> This MVP uses a curated official extract so the presentation is stable. The architecture is ready for a larger Supabase-backed dataset, but this demo should not be described as comprehensive citywide coverage.

## User Experience

### Home And Search

The home page starts with the product promise: "The grade is on the door. The story isn't." It immediately provides search, demo examples, and a product preview.

The search experience supports:

1. Restaurant name.
2. Cuisine.
3. Borough.
4. Address.
5. ZIP code.

The page also shows a data disclosure area with restaurant count, inspection count, official source, and extract date. This keeps the demo honest before the user starts browsing.

### Filter Bar

The filter bar lets users refine the current result set by:

1. Text search.
2. Cuisine.
3. Trajectory.
4. Confidence.
5. Recent critical flags.

The filters call the `/api/restaurants` endpoint with query parameters. Results update in the client without a full page refresh.

### Restaurant Cards

Each restaurant card shows:

1. Restaurant name.
2. Cuisine, neighborhood, and ZIP when available.
3. Current official grade.
4. Inspection reliability summary.
5. One plain-language explanation.
6. Public popularity metadata only when matched.
7. Actions to select the restaurant or open the full profile.

The card intentionally keeps the official grade near Sano context so users do not confuse derived labels with official ratings.

### Coverage Snapshot

The app uses a "coverage snapshot" instead of a fragile live map dependency. It shows borough and ZIP representation in the loaded results and a selected restaurant summary.

This is a practical demo choice. It preserves the intent of geographic discovery while avoiding presentation risk from a third-party map service.

### Restaurant Profile

The restaurant profile is the main proof of value.

It includes:

1. Official inspection data.
2. Current grade.
3. Inspection cycles on file.
4. Extract date.
5. Public popularity metadata when matched.
6. "The story so far" narrative.
7. Inspection reliability panel.
8. Inspection timeline.
9. Nearby alternatives from the current index.
10. Source context and disclosure.

The profile separates official source fields from Sano-derived interpretation. This is the most important product and ethics decision in the app.

### Inspection Timeline

The inspection timeline is the hero visualization. It shows inspection cycles in chronological order with:

1. Raw inspection scores.
2. Grade markers.
3. Critical flag markers.
4. Repeat pattern markers.
5. A trend line.
6. Plain inspection notes.

Lower raw inspection scores generally indicate fewer recorded inspection points. Sano turns those raw scores into a broader reliability signal, but the timeline keeps the underlying evidence visible.

### Methodology Page

The methodology page explains:

1. The official data source.
2. What the fields mean.
3. How the reliability score works.
4. How confidence works.
5. When trust gap is available.
6. How to read alternatives.
7. What Sano does not claim.

This page is essential for demo credibility. It shows that the app is not hiding the limitations of the data.

## Technical Architecture

Sano is built as a Next.js application with TypeScript, React, and Tailwind CSS.

Core stack:

1. Next.js 14 App Router.
2. React 18.
3. TypeScript.
4. Tailwind CSS.
5. Server components for page-level data loading.
6. Client components for search, filtering, and selection state.
7. Python scripts for data ingestion, scoring, validation, and Supabase loading.
8. Supabase-ready schema for larger app-ready records.

High-level flow:

```txt
NYC DOHMH Restaurant Inspection Results
        |
        v
Python ingestion script
        |
        v
Normalized restaurant and inspection records
        |
        v
Rules-based scoring script
        |
        v
Committed official seed JSON or Supabase records
        |
        v
Next.js API layer
        |
        v
Search, cards, profile, timeline, methodology
```

## Important Files

Application routes:

1. `app/page.tsx` loads restaurants and data summary for the home/search experience.
2. `app/restaurants/[id]/page.tsx` loads one restaurant profile.
3. `app/methodology/page.tsx` renders methodology and limitations.
4. `app/api/health/route.ts` reports app status and data-source summary.
5. `app/api/restaurants/route.ts` returns filtered restaurant lists.
6. `app/api/restaurants/[id]/route.ts` returns one restaurant record.

Core components:

1. `components/SearchShell.tsx` owns the interactive search page.
2. `components/FilterBar.tsx` owns search and filter controls.
3. `components/RestaurantCard.tsx` owns result-card presentation.
4. `components/MapResults.tsx` owns the coverage snapshot and selected restaurant panel.
5. `components/RestaurantProfile.tsx` owns the profile layout.
6. `components/SanoScorePanel.tsx` explains the derived reliability signal.
7. `components/TrustTimeline.tsx` renders the inspection timeline.
8. `components/Alternatives.tsx` shows nearby comparison records.
9. `components/MethodologyPanel.tsx` explains data, scoring, and limitations.

Shared logic:

1. `lib/types.ts` defines the shared restaurant, inspection, confidence, trajectory, and metadata types.
2. `lib/scoring.ts` contains the rules-based scoring and label functions.
3. `lib/format.ts` contains display formatting and profile narrative helpers.
4. `lib/server/restaurants.ts` selects the active data source, queries Supabase when configured, and falls back to committed JSON.
5. `lib/server/api-serialization.ts` serializes records for public API responses.

Data:

1. `data/official-restaurants.json` is the curated official demo seed.
2. `data/official-provenance.json` records source, pull, scoring, and extract metadata.
3. `data/place-metadata.json` stores optional reviewed popularity matches.
4. `data/sample-restaurants.json` is a synthetic fallback.

Scripts:

1. `scripts/ingest_nyc_dohmh.py` prepares official inspection data.
2. `scripts/score_restaurants.py` generates scored app-ready records.
3. `scripts/validate_restaurant_seed.py` validates seed shape and required fields.
4. `scripts/enrich_google_places.py` can enrich reviewed popularity metadata when configured.
5. `scripts/load_supabase_restaurants.py` can load app-ready records into Supabase.
6. `scripts/acceptance.mjs` runs end-to-end API and page checks.

## Data Layer

The data layer has two paths:

### Current Demo Path

The committed official seed is loaded from `data/official-restaurants.json`.

This path is stable and presentation-safe. It avoids relying on live APIs during the demo.

### Supabase-Ready Path

If Supabase environment variables are configured, the server attempts to read from a `restaurant_records` table through Supabase REST.

If Supabase is unavailable or empty, the app falls back to committed JSON.

Relevant environment variables:

1. `SUPABASE_URL`
2. `SUPABASE_SERVICE_ROLE_KEY`
3. `SUPABASE_ANON_KEY`

The Supabase schema stores searchable columns plus the complete app payload as JSONB. This lets the frontend keep a stable TypeScript contract while the backend grows.

## API Contract

### Health

`GET /api/health`

Returns:

1. App status.
2. Data mode.
3. Restaurant count.
4. Inspection count.
5. Source summary.
6. Extract date.
7. Provenance where available.

### Restaurant List

`GET /api/restaurants`

Optional query parameters:

1. `q`
2. `cuisine`
3. `trajectory`
4. `confidence`
5. `recentCriticalOnly`
6. `limit`

Returns:

1. `count`
2. `restaurants`

### Restaurant Profile Record

`GET /api/restaurants/:id`

Returns:

1. `restaurant`

If the restaurant does not exist, it returns a 404 JSON response.

## Scoring Model

Sano uses a rules-based scoring model. This is intentional. For the MVP, explainability matters more than model complexity.

### Inspection Reliability Score

The score is a 0-100 derived signal based on:

1. Average inspection burden.
2. Most recent inspection score.
3. Critical violation count.
4. Repeat pattern count.
5. Volatility penalty.
6. Improvement bonus.

The implementation clamps the result between 0 and 100.

Plain-English explanation:

> Sano rewards steadier, improving inspection histories and penalizes recent burden, critical flags, repeat patterns, and volatility.

### Recent Critical Flag

Sano checks the two most recent inspection cycles. If either has critical findings, the restaurant can receive a "Recent critical flag" label.

Use this wording:

> A recent critical flag is a recorded finding in the public inspection history. It is not a prediction.

### Trajectory

Trajectory can be:

1. Improving.
2. Stable.
3. Declining.
4. Volatile.

The app compares inspection scores over time and detects large swings. A swing of 12 points or more marks a volatile path.

### Confidence

Confidence is based on history depth:

1. High: at least 5 inspection cycles.
2. Medium: at least 3 inspection cycles.
3. Limited: fewer than 3 inspection cycles.

Limited history receives restrained labels so thin records are not over-interpreted.

### Labels

Sano labels are derived from reliability, trajectory, confidence, and recent criticals:

1. `Limited data`
2. `Recent critical flag`
3. `Volatile history`
4. `Improving record`
5. `Consistent record`

### Low Signal Display

When the derived score is below 15, the UI shows "Needs review" or "Low signal" rather than relying on a bare low number. This keeps the presentation measured and avoids making the score feel like an absolute verdict.

## Design And Interaction Decisions

Sano is designed to feel calm, precise, and consumer-readable.

Important design choices:

1. Official grade remains visually present.
2. Derived context is next to, not above, the official grade.
3. Missing popularity metadata is shown as "Not matched yet."
4. Data limitations are visible on the home page, profile page, and methodology page.
5. The timeline uses markers for critical flags and repeat patterns so users can see why a label exists.
6. The app avoids fear-based color or copy.
7. The typography and visual hierarchy make the app feel polished without turning inspection data into alarm.

## How To Run The App Locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Validate data:

```bash
npm run validate:official
npm run validate:synthetic
```

Build:

```bash
npm run build
```

Run acceptance checks after starting the app:

```bash
npm run acceptance
```

## Demo Flow

Use this sequence for a 4-5 minute demo.

### 1. Open With The Problem

Say:

> A restaurant grade is useful, but it is compressed. Sano keeps the official grade visible, then shows the inspection history behind it in a way a diner can understand quickly.

Show:

1. Home page headline.
2. Data source disclosure.
3. Search box.

### 2. Search A Real Slice

Search for one of the built-in demo examples, such as `11101`, `Long Island City`, `Thai`, or a featured restaurant name.

Say:

> The interface behaves like discovery, but every result is anchored to inspection history and data confidence.

Show:

1. Restaurant cards.
2. Filters.
3. Coverage snapshot.

### 3. Open A Profile

Open a restaurant profile with at least 3-5 inspection cycles.

Say:

> This is where Sano becomes more than a list. The profile keeps official fields visible, then adds a plain-language reading of the record.

Show:

1. Official inspection data.
2. Story so far.
3. Reliability panel.

### 4. Explain The Timeline

Point to the inspection timeline.

Say:

> The timeline is the evidence. It shows dates, raw scores, grades, critical flags, repeat patterns, and trend. The label is not magic; it is a summary of what the record already shows.

Show:

1. Raw scores.
2. Critical markers.
3. Repeat markers.
4. Trend label.

### 5. Close With Methodology

Open the methodology page.

Say:

> The most important engineering decision is restraint. We do not invent popularity data, we do not claim real-time coverage, and we do not turn public records into safety verdicts.

Show:

1. Official data disclosure.
2. Reliability score explanation.
3. What Sano does not claim.

## Distinguished Engineer Demo Script

Use this script when presenting to a technical audience.

### Opening

Sano starts with a simple observation: the inspection grade on the door is useful, but it is a compression. It tells you the current public signal, but not the pattern that produced it.

This application keeps the grade visible and adds the missing context: history depth, inspection trajectory, recent critical findings, repeat patterns, and the confidence we have in the record.

### Architecture

The app is built with Next.js, TypeScript, and Tailwind. Page routes load app-ready restaurant records on the server. Search and filters run through a stable API contract. The scoring logic is isolated in shared TypeScript so UI components do not own product rules.

The data pipeline starts with NYC DOHMH public inspection records, normalizes the inspection history, applies a rules-based scoring layer, and emits app-ready restaurant payloads. For the demo, those payloads are committed as a curated official seed. The same shape can also be served from Supabase.

### Why Rules-Based

The score is intentionally rules-based. In this domain, the model must be explainable. If a label appears, the user should be able to see the evidence on the timeline: a recent critical flag, a repeated pattern, a volatile swing, or a limited history.

### Why The Wording Matters

We are not making health claims. We are not replacing the official grade. Sano is a translation layer over public history. That restraint is what makes the product credible.

### Close

The broader opportunity is to make public datasets feel usable without stripping away their limitations. Sano shows how a small, careful product layer can turn a government record into a consumer decision aid without pretending the data says more than it does.

## Recommended Demo Records

The app has built-in preferred demo journey IDs:

1. `50169790`
2. `50006959`
3. `50131593`

If those are present, the home page chooses them for demo journeys. If they are not present, the app falls back to records that tell useful stories, such as volatile history, consistent records, recent critical flags, or improving trajectories.

Suggested search terms:

1. `11101` (Pursuit / Long Island City — Austell Place area)
2. `Long Island City`
3. `Thai`
4. `Lucky Chix`

Before a live demo, choose one profile and rehearse the exact timeline explanation. Do not improvise health claims.

## Information To Display On Slides

Keep slides selective. The audience should remember the product judgment, not every implementation detail.

Display:

1. Product promise.
2. User problem.
3. High-level architecture.
4. Data and scoring principles.
5. Demo flow.
6. Limitations and trust language.

Do not display:

1. A long formula.
2. Raw violation details that could make the talk feel punitive.
3. Restaurant names in a way that appears to shame a business.
4. Claims of complete city coverage.
5. Any language implying illness prediction.

## Prezi Prompt For A 4-Slide PowerPoint

Copy this prompt into Prezi AI or a similar presentation generator.

```txt
Create a polished 4-slide PowerPoint presentation for a technical product demo of an application named Sano.

Audience: senior engineers, product leaders, and demo reviewers.
Tone: calm, precise, premium, and restrained, like a distinguished engineer presenting a thoughtful consumer product. Do not use fear-based language. Do not overclaim. Avoid saying safe, unsafe, dangerous, sick, or predicts illness.
Visual style: Apple-inspired clarity, generous whitespace, high contrast, refined typography, minimal text, elegant product screenshots or screenshot placeholders, neutral off-white background, deep ink text, moss green and restrained blue accents. No clutter, no gimmicks.

Slide 1 title: Sano
Subtitle: The grade is on the door. The story is in the history.
Content: Sano turns NYC public restaurant inspection records into clear comparison context: trajectory, recent flags, repeat patterns, and history depth.
Speaker note: Sano does not replace official grades. It explains what a single grade compresses away.

Slide 2 title: The Product Judgment
Content: Restaurant grades are useful but compressed. Sano keeps official grades visible, then adds plain-language inspection context so diners can compare similar options with more confidence.
Visual: Simple before-and-after: "Grade only" -> "Grade + timeline + explanation + confidence."
Speaker note: The product is not more judgment. It is better context with visible limitations.

Slide 3 title: How It Was Built
Content: Next.js + TypeScript frontend. NYC DOHMH public inspection records. Python ingestion and scoring pipeline. App-ready JSON seed for demo stability. Supabase-ready data layer for scale. Rules-based scoring so every label can be explained.
Visual: Clean pipeline diagram: DOHMH records -> ingestion -> normalized inspections -> scoring -> API -> search/profile/timeline.
Speaker note: The demo uses a curated official extract so the experience is stable, and the architecture can move to larger Supabase-backed records.

Slide 4 title: The Demo Moment
Content: Search. Open a profile. Read the timeline. Explain the signal. Show methodology.
Key line: Sano is context from public inspection history, not a safety verdict.
Visual: Large screenshot placeholder of restaurant profile timeline with small callouts for grade, reliability, critical marker, repeat pattern, and confidence.
Speaker note: The timeline is the evidence. The label is only a summary of what the record shows.

Final instruction: Keep each slide visually sparse. Use no more than 35 words of body copy per slide. Put detailed explanation in speaker notes, not on the slide.
```

## Prezi Prompt For A 5-Slide PowerPoint

Use this version if the presentation needs one more slide for architecture.

```txt
Create a refined 5-slide PowerPoint presentation for Sano, a restaurant discovery and inspection-history interpretation app.

Audience: senior engineers, product leaders, and demo reviewers.
Tone: distinguished engineer presenting at Apple: clear, concise, composed, precise, and deeply intentional. No hype. No fear-based language. No health or safety verdicts.
Design: premium software demo style, off-white background, deep ink text, moss green and restrained blue accents, generous whitespace, elegant typography, screenshot-first composition, minimal bullets, no decorative clutter.

Slide 1 title: Sano
Subtitle: The grade is on the door. The story is in the history.
Body: A consumer discovery experience that turns NYC public inspection records into readable comparison context.
Speaker note: Open by saying that Sano preserves the official grade and reveals the pattern behind it.

Slide 2 title: The Problem
Body: A posted grade is useful, but compressed. It does not show trajectory, volatility, repeat patterns, recent critical flags, or how much history supports the view.
Visual: One large letter-grade badge beside a thin timeline emerging behind it.
Speaker note: The problem is not lack of public data. The problem is that the data is hard to use in the moment of choice.

Slide 3 title: The Experience
Body: Search restaurants. Compare cards. Open a profile. Read the inspection timeline. See confidence and limitations.
Visual: Three product screenshots or placeholders: search, card, profile timeline.
Speaker note: The interface feels familiar, but the decision layer is inspection history rather than popularity alone.

Slide 4 title: The System
Body: Next.js, TypeScript, Tailwind, typed API routes, Python ingestion, rules-based scoring, curated official JSON seed, Supabase-ready schema.
Visual: Architecture pipeline: NYC DOHMH -> ingestion -> normalized records -> scoring -> API -> UI.
Speaker note: The score is rules-based by design. In this domain, explainability and restraint are engineering requirements.

Slide 5 title: The Principle
Body: Official data first. Derived context second. Limitations always visible.
Key line: Sano is not a safety verdict. It is a clearer way to read public inspection history.
Visual: Profile timeline screenshot with three callouts: official grade, derived signal, methodology disclosure.
Speaker note: Close on trust. The product earns credibility by showing what the data can say and what it cannot.

Final instruction: Keep slide body copy under 30 words per slide. Place explanation in speaker notes. Avoid showing raw violation language or singling out restaurants in a punitive way.
```

## Suggested Slide Copy

Use these lines exactly if you want a restrained, high-quality deck.

1. "The grade is on the door. The story is in the history."
2. "Sano keeps the official grade visible, then explains the inspection pattern behind it."
3. "Every derived signal is backed by visible evidence: dates, scores, flags, repeat patterns, and confidence."
4. "The score is rules-based by design because this product has to be explainable."
5. "Sano is context from public inspection history, not a safety verdict."

## Presenter Do's And Don'ts

Do:

1. Say "public inspection history."
2. Say "derived context."
3. Say "current grade remains official."
4. Say "curated official extract."
5. Say "not comprehensive citywide coverage."
6. Say "not real-time."
7. Say "not a safety verdict."

Don't:

1. Say "we know which restaurants are clean."
2. Say "we predict risk."
3. Say "this grade is wrong."
4. Say "this restaurant is bad."
5. Say "the app proves safety."
6. Say "complete NYC coverage" unless Supabase has been loaded and verified.

## Final Positioning

Sano is strongest when presented as a careful translation layer.

The engineering quality is not only in the stack. It is in the restraint:

1. Stable data path for demo reliability.
2. Typed contracts for predictable UI behavior.
3. Isolated scoring logic for explainability.
4. Visible source disclosures.
5. Clear fallback strategy.
6. Carefully chosen language that respects the limits of public records.

The app's best closing line:

> Sano makes public inspection history readable without pretending it says more than it does.
