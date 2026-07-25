# Sano Product Requirements Document

Status: MVP build plan  
Timeline: one week  
Team size: 3 contributors

## North Star

We are not building "a restaurant app." We are building one polished proof that inspection history contains useful context hidden by public grades.

## Product Summary

Sano is a consumer restaurant discovery app that interprets official inspection history alongside popularity signals. It helps diners understand whether a restaurant's inspection record is stable, improving, volatile, or showing repeat patterns.

Sano does not replace official grades. It explains the history underneath them.

## Problem

Diners often choose among restaurants that all look acceptable: high ratings, convenient locations, familiar cuisines, and current public grades. The posted grade is a compressed snapshot and does not quickly show:

- Whether inspection scores are improving or declining.
- Whether critical violations are repeated.
- Whether a restaurant has a volatile inspection history.
- Whether two A-grade restaurants have very different underlying records.

Public inspection data exists, but it is not presented inside a normal discovery workflow in a way most diners can understand quickly.

## Target Users

### Everyday Diner

Goal: choose where to eat soon.

Needs:

- Fast search.
- Familiar restaurant-discovery UI.
- Clear explanation when two similar restaurants differ.
- No fear-based or overly technical language.

### Cautious Diner Or Caregiver

Goal: choose with a higher trust threshold.

Needs:

- Filtering by stronger inspection history.
- Plain-English explanations.
- Confidence and data recency indicators.
- Clear limitations.

## Product Goals

1. Make inspection history legible inside a consumer discovery flow.
2. Distinguish among restaurants with similar ratings or public grades.
3. Explain every derived signal in plain language.
4. Clearly distinguish synthetic demo data from future real official inspection data.
5. Ship a demo whose value is understandable in 30 seconds.

## Non-Goals

1. Do not make illness or causation claims.
2. Do not label restaurants as absolutely safe or unsafe.
3. Do not build owner tools.
4. Do not scrape reviews.
5. Do not support nationwide coverage.
6. Do not require login.
7. Do not let live external APIs create presentation risk.

## MVP User Flow

1. User opens Sano.
2. User sees a search/list/map interface.
3. User searches or filters for a cuisine or neighborhood.
4. User sees several restaurant cards that look familiar but include Sano context.
5. User opens a restaurant profile.
6. User sees an inspection timeline and plain-English explanation.
7. User compares alternatives with stronger inspection trajectories.
8. User can open methodology to understand the formula and limitations.

## MVP Requirements

### Search And Results

- Restaurant search by name, cuisine, or neighborhood.
- Filter controls for cuisine, rating, trajectory, recent criticals, and confidence.
- List of restaurants.
- Map or map-like geographic panel.
- Selected restaurant state.

### Restaurant Card

Each card should display:

- Name
- Cuisine
- Neighborhood
- Public rating
- Review count
- Current public grade
- Sano label
- Confidence
- One-sentence driver explanation

### Restaurant Profile

Each profile should display:

- Name
- Cuisine
- Neighborhood
- Rating
- Review count
- Current grade
- Inspection Reliability Score
- Trust Gap
- Trajectory
- Confidence
- Data as-of date
- Inspection timeline
- Alternatives
- Raw/source reference area where possible
- Disclaimer

### Inspection Timeline

The timeline is the hero visualization.

It should show:

- At least 4 to 5 inspection cycles.
- Inspection dates.
- Raw inspection scores.
- Grade markers.
- Critical violation markers.
- Repeat pattern markers.
- Improving, stable, declining, or volatile trend.

### Methodology

The methodology page should explain:

- Data source.
- Data freshness.
- Scoring formula.
- Confidence rules.
- Trust Gap rules.
- Limitations.
- Ethical language rules.

## Core Concepts

### Inspection Reliability Score

A 0-100 derived score based on inspection burden, recency, critical flags, repeat patterns, volatility, and improvement.

### Trajectory

One of:

- Improving
- Stable
- Declining
- Volatile

### Trust Gap

The difference between popularity percentile and inspection reliability percentile within a comparable cohort.

### Confidence

A display signal based on match confidence, history depth, and data recency.

## Display Rules

1. Use neutral labels.
2. Explain every label.
3. Do not rely on color alone.
4. Show limitations.
5. Avoid words like "safe," "unsafe," "dangerous," or "sick."
6. Prefer phrases like "volatile inspection history," "repeat pattern," "recent critical flag," and "limited data."

## Success Criteria

The MVP is successful when:

1. A user can browse restaurants.
2. A user can open a profile.
3. A user understands why the timeline matters.
4. A user can explain what the Sano label means.
5. The team can present the demo in under 5 minutes.
6. The app is deployed and stable.
