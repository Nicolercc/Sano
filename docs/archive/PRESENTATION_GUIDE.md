# Sano Presentation Guide

Use this guide to prepare a developer, new contributor, or presenter to explain
what Sano is, why it exists, how the app works, and why the interface was
designed this way.

## The Short Version

Sano is a restaurant discovery app that helps people read official restaurant
inspection history more clearly.

The app does not replace NYC inspection grades. It keeps the official grade
visible and adds plain-language context about the inspection timeline underneath
that grade: trajectory, recent critical flags, repeat patterns, confidence, and
history depth.

The core thesis is:

> The grade is on the door. The story is not.

That sentence is the product. Everything in the interface supports it.

## Why We Built It

People often choose between restaurants that look similar from the outside:
same neighborhood, familiar cuisine, acceptable posted grade, and maybe the same
general popularity. Public inspection data exists, but most diners will not open
a government dataset, compare inspection cycles, and interpret patterns while
deciding where to eat.

Sano turns that hard-to-read public history into a comparison layer.

It helps answer questions like:

- Did this restaurant's inspection record improve over time?
- Are recent inspections different from older inspections?
- Are there repeat patterns?
- Is there enough history to trust the summary?
- Are we missing popularity metadata, and if so, are we honest about that?

Sano is useful because it gives context without turning the product into a fear
dashboard. The goal is informed choice, not panic.

## Who It Helps

Sano helps everyday diners who want quick context before choosing a place to
eat. It also helps cautious diners and caregivers who may have a higher
threshold for trust when choosing food for children, older adults, pregnant
people, immunocompromised people, or anyone with a lower risk tolerance.

It also helps developers and product builders learn an important lesson:
official public data can be valuable, but the product has to explain its limits
clearly.

## What The App Does

The app lets a user:

- Search restaurants by name, cuisine, borough, ZIP, or neighborhood.
- Filter by trajectory, confidence, and recent critical flags.
- Browse a map-like results panel and restaurant cards.
- Open a restaurant profile.
- Read the official grade alongside Sano's derived inspection-history context.
- Review an inspection timeline.
- Compare suggested alternatives.
- Open the methodology page to understand formulas and limitations.

The most important screen is the restaurant profile. The most important
visualization is the inspection timeline.

## What The App Does Not Do

Sano does not:

- Claim that a restaurant is safe or unsafe.
- Predict illness or future risk.
- Replace official NYC grades.
- Invent public ratings, review counts, prices, or popularity signals.
- Scrape reviews.
- Depend on live external APIs during the final demo.
- Cover every restaurant in New York City yet.

This restraint is intentional. It makes the product more credible.

## The Data Story

The demo uses a curated offline seed generated from NYC DOHMH Restaurant
Inspection Results. That means the presentation can be stable even if an
external API is slow, unavailable, or changes during the demo.

The app has three important data modes:

- `official-generated-seed`: the primary demo mode, generated from public NYC
  DOHMH inspection records.
- `supabase-app-records`: the future scale path when Supabase has app-ready
  records.
- `synthetic-demo-seed`: a controlled fallback for failure containment only.

The correct way to explain this is:

> Sano demonstrates how public NYC inspection records can be prepared into a
> consumer-friendly discovery layer. The current demo uses a curated offline
> extract for stability. It is not real-time synchronization or comprehensive
> citywide coverage.

## The Scoring Story

Sano's Inspection Reliability Score is a rules-based 0-100 signal. It is not
machine learning, and it is not an official city score.

At a high level, the score considers:

- Average inspection score.
- Most recent inspection score.
- Critical violation count.
- Repeat patterns.
- Volatility.
- Improvement over time.

Lower official inspection scores generally indicate fewer recorded inspection
points against the restaurant, so they generally improve Sano's derived
reliability score.

The score is intentionally explainable. If someone asks "why did this restaurant
get that label?", the team can point to the timeline, the critical flags, repeat
markers, recent score, and confidence.

## Confidence And Trust Gap

Confidence is about history depth in this demo. More inspection cycles give the
app more timeline to interpret. Limited history gets restrained labels so Sano
does not overstate thin records.

Trust Gap compares popularity percentile with inspection reliability percentile
only when popularity metadata exists. In the current official-inspection mode,
public rating and review metadata may be unavailable. When it is unavailable,
Sano leaves it blank instead of inventing it.

That is a product decision and an ethics decision.

## Design Intent

The visual design is meant to feel credible, warm, and consumer-friendly. It
should not feel like a legal compliance dashboard, a panic warning system, or a
generic restaurant review clone.

The app uses a contrast between:

- Official public records.
- Derived Sano context.
- Human-readable explanation.

The interface keeps the official grade visible because Sano is not trying to
hide or replace it. The surrounding context explains what the grade compresses.

## Parallax-Inspired Hero

The landing experience uses a parallax-inspired layered hero. It is not a heavy
JavaScript parallax engine. Instead, the effect comes from visual depth:

- A dark background layer with grid texture and soft radial light.
- A floating product preview panel.
- Inspection-like marks and official-grade visual cues.
- A bridge section that overlaps the hero as the user scrolls.
- Smooth scrolling from the hero search into the search/results section.

This was intentional because the product is about layers of information. The
posted grade is the visible surface. The inspection history is the layer
underneath. The visual system echoes that idea.

If someone asks whether the app uses "real parallax," answer honestly:

> It uses a parallax-inspired composition rather than scroll-position animation.
> We chose layered depth because it gives the demo polish without adding motion
> complexity or accessibility risk.

## Navigation Change

The navigation was changed into a sticky, rounded pill that sits over the top of
the experience.

That change was intentional for four reasons:

1. It makes the app feel like a polished product instead of a static school
   project.
2. It keeps the Methodology page one click away, which matters because the app
   makes derived claims that need explanation.
3. It supports the demo path with anchors for How it works, Search, and Demo.
4. It stays usable while the presenter scrolls, so the presentation can recover
   quickly if someone asks to jump to another section.

On smaller screens, some links are hidden to prevent crowding. Methodology and
Try Sano remain visible because they are the highest-value actions.

The navigation should be explained as part of the trust design: Sano does not
bury its methodology.

## Color System

The colors are intentional:

- `ink` (`#17201b`): primary text; serious and legible.
- `oat` (`#f6f2ea`): warm page background; makes the app feel approachable.
- `moss` (`#486b55`): steady positive signal; used for stronger records and
  calm trust cues.
- `mint` (`#dff3e7`): soft support color for official inspection panels.
- `coral` (`#c8664c`): critical flags and lower-confidence attention states.
- `amber` (`#d69d3f`): caution, repeat patterns, and medium confidence.
- `brand blue` (`#2563c9`): primary action and product emphasis.
- `soft blue` (`#6fa3e0`): focus, glow, and secondary brand detail.
- `red pen` (`#c22`): official grade stamp energy in the hero.
- `grade gold` (`#d4af37`): visual reference to review/star culture, used
  carefully so it does not imply invented ratings.

The colors do not carry meaning alone. Labels, headings, badges, and explanatory
copy are also present. That matters for accessibility and for ethical clarity.

## Accessibility Case Study

Sano also carries a scoped accessibility audit, documented in full under
`docs/accessibility-audit/`. This is one of the strongest technical artifacts
in the repo and should be raised proactively in interviews, not left for
someone to stumble on.

The short version: the audit was scoped to one critical journey (landing →
search → filters → results → restaurant profile → inspection timeline →
methodology), not the whole app, and it does not claim WCAG conformance.
Every finding is logged with severity, the WCAG criterion it maps to, before
evidence, and a specific validation method — automated where possible, manual
where it has to be.

What actually shipped:

- Contrast fixes: low-opacity text tokens (`ink/45`–`/60`, `white/40`–`/52`)
  replaced with tokens verified at 4.5:1+ against every background they
  appear on, plus dedicated darker tokens (`coralText`, `amberText`) for
  warning text that previously fell as low as 2.15:1.
- Keyboard focus: every filter input/select got a real `focus-visible` style
  instead of relying on border-color alone, and hero search submit now moves
  focus to the results heading instead of leaving it stranded in the hero.
- A live region (`aria-live="polite"`) announces search status (loading,
  result count, empty, error) to screen-reader users — with a debounce, so it
  doesn't fire once per keystroke.
- Semantic fixes: the score panel's visual heading is now a real `<h2>`, and
  the restaurant-not-found route's local nav has an accessible name.
- A regression suite (`npm run a11y`) that fails the build if any of the
  above regresses — contrast math, focus-style presence, live-region count,
  and the debounce, all checked automatically on every `npm run check`.

**The best story in this audit, and the one to lead with in an interview:**
after wiring up the live region, a self-review caught that it would announce
on every keystroke, because the search fetch had no debounce — so a user
typing a 6-letter query would hear six overlapping "Searching… / N shown"
announcements. The fix added a 500ms debounce specifically for the announced
text (the fetch itself stays reactive), and the fix was verified by literally
driving the app and polling the live region's DOM value during typing: it
changed exactly once, ~500ms after the last keystroke, and settled on the
correct count. That trace — from noticing a defect class, to root-causing it
in the actual data flow, to a targeted fix, to a measured (not assumed)
verification — is a stronger signal than any of the individual fixes.

A second, more humbling story worth having ready: an earlier evidence-capture
pass leaked the operator's real browser bookmarks and tabs into "after"
screenshots, and a scroll-stitching bug had duplicated whole sections of the
page in a screenshot that was already committed as "validated" proof. Both
were caught in a self-audit before anything was published externally, fixed,
and documented with an explicit correction note rather than quietly
replacing the files. If asked about a time a mistake was caught late, this is
real, specific, and shows verification discipline rather than carelessness —
but only if it's told with the actual git commit that fixed it, not vaguely.

What is explicitly **not** done, and should be stated as such rather than
implied: a full human screen-reader (VoiceOver/NVDA) listening pass, 400%
zoom/reflow testing, and reduced-motion review. The audit is honest about
this in `findings.md` and `validation.md` — say the same thing out loud in an
interview rather than letting silence imply full coverage.

## Developer Mental Model

The code is organized around clear boundaries:

- `app/page.tsx` loads restaurant records and renders the search experience.
- `components/SearchShell.tsx` owns the landing/search page, filters, hero,
  demo journeys, and selected restaurant state.
- `components/AppNav.tsx` owns the sticky primary navigation.
- `components/RestaurantCard.tsx` owns each result card.
- `components/MapResults.tsx` owns the map-like geographic panel.
- `app/restaurants/[id]/page.tsx` loads a single restaurant profile.
- `components/RestaurantProfile.tsx` lays out the profile page.
- `components/TrustTimeline.tsx` renders the inspection timeline.
- `components/SanoScorePanel.tsx` explains derived scoring context.
- `components/MethodologyPanel.tsx` explains data source, scoring, and limits.
- `lib/scoring.ts` contains scoring, trajectory, confidence, and label logic.
- `lib/server/restaurants.ts` chooses between Supabase, official seed, and
  fallback seed.
- `app/api/*` exposes the health and restaurant API contracts.

The key engineering principle is separation:

Product display belongs in components. Scoring belongs in `lib/scoring.ts`.
Server data selection belongs in `lib/server/restaurants.ts`. Documentation
belongs in `docs/`.

## Demo Walkthrough

Use this flow for a 3-5 minute presentation:

1. Open the home page.
2. Say: "Sano turns public NYC restaurant inspection history into clear
   comparison context. It is not a safety verdict."
3. Point to the hero thesis: "The grade is on the door. The story isn't."
4. Explain the layered hero: "The visual design shows the idea of surface grade
   plus deeper inspection history."
5. Use the nav to open How it works.
6. Explain the three steps: official records, pattern detection, honest
   limitations.
7. Click a "Try:" chip (Manhattan, Brooklyn, or Coffee) or choose one of the demo profiles.
8. Open a profile such as Lucky Chix.
9. Point to the official grade first.
10. Point to Sano's reliability score, label, trajectory, and confidence.
11. Explain the timeline: bars are inspection scores over time, markers show
    critical flags or repeat patterns, and the trend shows movement.
12. Explain that popularity metadata stays unavailable unless matched.
13. Open Methodology from the sticky nav.
14. End with the limitation: "Sano is context from public inspection records,
    not an official rating or real-time safety status."

## Phrases To Use

Use language like:

- "Inspection-history context."
- "Derived signal."
- "Plain-language summary."
- "Public records prepared for comparison."
- "Current grade plus timeline."
- "Not a safety verdict."
- "Not an official NYC rating."
- "Unavailable metadata stays unavailable."

Avoid language like:

- "This restaurant is safe."
- "This restaurant is unsafe."
- "This predicts illness."
- "This is better than the official grade."
- "This is live citywide inspection coverage."
- "This score is official."

## Questions People May Ask

### What is Sano?

Sano is a restaurant discovery app that turns public NYC restaurant inspection
records into clear comparison context. It helps users understand the history
behind a posted grade.

### Why not just use the official grade?

The official grade is useful, but it is compressed. Two restaurants can both
show an A while having different inspection histories. Sano keeps the grade
visible and adds the timeline underneath it.

### Is Sano saying a restaurant is safe or unsafe?

No. Sano does not make safety verdicts. It summarizes public inspection history
for comparison and keeps limitations visible.

### Is the Inspection Reliability Score official?

No. It is a Sano-derived, rules-based score. The official city grade remains
visible and separate.

### Why is the score rules-based instead of AI or machine learning?

For this MVP, explainability is more important than prediction. A rules-based
formula lets the team show exactly why a label appears.

### Where does the data come from?

The demo uses a curated offline seed generated from NYC DOHMH Restaurant
Inspection Results. It is public inspection data prepared into an app-ready
format.

### Is the data live?

No. The demo uses an offline extract for stability. That avoids depending on a
live external service during the presentation.

### Why are ratings and review counts missing?

NYC DOHMH inspection records do not include consumer ratings or review counts.
Sano only shows those fields when a separate public metadata source has been
matched. Otherwise, it leaves them unavailable.

### What is Trust Gap?

Trust Gap compares popularity with inspection reliability only when both kinds
of data exist. If popularity metadata is missing, the trust gap is unavailable.

### Why include alternatives?

Alternatives help users compare inspection trajectories inside the demo set.
They are not endorsements and do not claim one restaurant is healthier or
officially preferred.

### Why does the app look warmer than a government dashboard?

Because the user is a diner, not an inspector. The design needs to feel clear,
calm, and consumer-friendly while still respecting the seriousness of the data.

### Why use a dark hero?

The dark hero creates contrast and makes the thesis feel memorable. It also
lets the product preview stand forward as the first concrete example of the app.

### What is the parallax effect doing?

The page uses layered, parallax-inspired depth to communicate the idea of hidden
context beneath a visible grade. It is visual storytelling, not a complex motion
system.

### Why did we change the navigation?

The sticky pill navigation supports the live demo. It keeps Methodology and Try
Sano available while scrolling, and it makes the product feel more finished.

### How do we know the app is not fear-based?

The copy avoids absolute safety language, the official grade stays visible, the
methodology is easy to find, and missing data is not invented.

### What would come next after the MVP?

The next steps would be broader Supabase-backed coverage, scheduled refreshes,
reviewed public metadata matching, stronger map behavior, saved lists, and more
robust methodology review.

### What did the accessibility audit find, and is it fully accessible now?

No — and say that directly. The audit is scoped to one critical journey and
does not claim WCAG conformance. It found and fixed real contrast, keyboard
focus, focus-order, and semantic issues, and added a live region for search
status with a debounce fix caught during self-review. What's still open: a
full screen-reader listening pass, 400% zoom/reflow, and reduced motion. See
`docs/accessibility-audit/` for the full findings log and validation plan.

### What was the hardest tradeoff?

The hardest tradeoff was making inspection risk understandable without
overclaiming. The app has to be useful, but it also has to be humble about what
public inspection history can and cannot prove.

## Final Audit Notes

Before presenting, confirm:

- The home page loads.
- Search works.
- The demo profile opens.
- The timeline is visible.
- Methodology is reachable from the sticky nav.
- `/api/health` returns the expected data mode.
- The team can explain that the demo is not live citywide coverage.
- The team can explain that Sano-derived labels are not official grades.
- Every "Try:" chip actually returns results against the data mode being demoed — run `npm run acceptance` against the live server, don't assume.
- The team can speak to the accessibility audit in `docs/accessibility-audit/` without opening the docs cold — see the Accessibility Case Study section above.

The strongest presentation is not "we built a restaurant app." The strongest
presentation is:

> We built a trustworthy way to read the inspection history behind a restaurant
> grade.
