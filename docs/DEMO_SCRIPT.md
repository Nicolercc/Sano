# Demo Script

Goal: present Sano clearly in under 5 minutes.

## Opening

Sano is a restaurant discovery app that interprets inspection history alongside popularity. It helps diners see what a single posted public grade compresses away.

The key idea is that two restaurants can both have strong ratings and current A grades, but very different inspection trajectories underneath.

## Demo Flow

### 1. Start On Search

Show the main search/list/map page.

Say:

"This begins like a familiar restaurant discovery experience: search, filters, map, ratings, cuisine, and location."

### 2. Point Out The Difference

Show restaurant cards with Sano labels.

Say:

"The difference is that Sano adds inspection-history interpretation. Instead of only showing the current grade, it summarizes the pattern behind the grade."

### 3. Select A Restaurant

Choose a restaurant with a volatile or repeat-pattern history.

Say:

"This restaurant looks strong on the surface, but Sano flags that the underlying inspection history deserves a closer look."

### 4. Show The Profile

Open the restaurant profile.

Mention:

- Current grade
- Public rating
- Inspection Reliability Score
- Trajectory
- Trust Gap
- Confidence
- Data as-of date

### 5. Show The Timeline

Pause on the timeline.

Say:

"This is the core product moment. The timeline shows inspection cycles over time, including raw scores, grade changes, critical flags, and repeated patterns. This is the information compressed away by a single posted grade."

### 6. Explain The Label

Read the one-sentence explanation.

Say:

"Every Sano label is explainable. The user should never have to trust a black-box score."

### 7. Show Alternatives

Scroll to alternatives.

Say:

"Sano is not a warning app. It is a recommendation layer. If a diner wants a similar option with a stronger inspection trajectory, the app can show alternatives."

### 8. Show Methodology

Open methodology.

Say:

"The methodology page explains the data source, scoring rules, confidence rules, and limitations. Sano does not claim that a restaurant is safe or unsafe. It interprets official inspection history and shows the reasoning."

## Closing

Sano makes public inspection data usable in the moment of choice. It turns a compressed grade snapshot into an understandable history, without making absolute safety claims.

## Backup Talking Points

### Why Not Just Show The Grade?

Because the grade is a snapshot. Sano shows trajectory, volatility, repeat patterns, and confidence.

### Why Use A Curated Real-Data Seed?

Because the demo should be stable. The seed should be derived from official data, while the architecture supports a database-backed version.

### Why No Machine Learning?

Because the MVP needs explainability. Every score and label should be understandable and defensible.

### Why This Stack?

Next.js and Vercel make deployment fast. TypeScript keeps data contracts clear. Supabase supports Postgres and geospatial expansion. Python is well-suited for ingestion and scoring.

