# Agent Orchestration Guide

This guide explains how to use Codex, Cursor, and Claude to set the Sano foundation without creating conflicting work.

## Operating Principle

Use one tool as the source-of-truth editor at a time.

Do not ask multiple agents to rewrite the same file or solve the same architectural decision independently. That creates conflicting versions of the app.

For the desktop decision-cockpit redesign, use
`docs/DESKTOP_COCKPIT_EXECUTION_PLAN.md` as the active source of truth. The
older sprint plan still explains the original MVP sequence, but cockpit work
should follow the newer file ownership, phase order, copy guardrails, and data
quality gates.

## Recommended Agent Roles

### Codex: Repository And Implementation Lead

Use Codex for repo-wide work: reading the whole project, editing multiple files safely, scaffolding, running commands, checking git status, verifying builds, and making integration decisions.

### Cursor: Focused Coding Pair

Use Cursor for one narrow code task at a time: one component, one helper, one layout polish pass, or one bug fix. Cursor works best when the relevant files are open and the prompt says which files not to touch.

### Claude: Product, Writing, And Review Partner

Use Claude for product clarity, presentation wording, methodology review, ethical language review, and explaining technical tradeoffs to a non-technical audience.

## Should We Have A File For Each Phase?

No, not for a three-person one-week project.

Use:

- `docs/SPRINT_PLAN.md` for the phases.
- `docs/TASK_BREAKDOWN.md` for assignments.
- `docs/TEAM_OPERATING_MODEL.md` for collaboration rules.
- GitHub issues or branch names for active work.

Separate phase files would add reading overhead and create more places for the plan to drift.

## Foundation Sequence

1. Codex keeps the repo coherent and verifies builds.
2. Claude reviews product wording and presentation clarity.
3. Cursor handles narrow component tasks.
4. Codex integrates, reviews, and validates before merge.

## Prompt For Codex: Integration Review

```txt
You are reviewing the current Sano implementation before merge.

Read:
- README.md
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/DATA_PLAN.md
- docs/TEAM_OPERATING_MODEL.md

Check:
1. Does the app still follow the product thesis?
2. Are shared types consistent?
3. Does any UI duplicate scoring logic?
4. Are there absolute safety claims?
5. Are any files outside the task scope changed?
6. Does the app build?
7. Is the demo path still working?

Return findings first, ordered by severity, with file references.
```

## Prompt For Cursor: Restaurant Card

```txt
Work only on `components/RestaurantCard.tsx`.

Project context:
- Sano is a Next.js + TypeScript + Tailwind app.
- Sano interprets official restaurant inspection history. Popularity metadata is shown only when a real source exists.
- Sano is not a generic restaurant app.

Task:
Improve the restaurant card display.

Show:
- name
- cuisine
- neighborhood
- external rating only if separately sourced
- external review count only if separately sourced
- current grade
- Sano label
- confidence
- one-sentence explanation

Constraints:
- Use the existing Restaurant type.
- Do not change `lib/types.ts`.
- Do not edit `data/sample-restaurants.json`.
- Do not add dependencies.
- Use neutral language. No safe/unsafe claims.
```

## Prompt For Cursor: Timeline

```txt
Work only on `components/TrustTimeline.tsx`.

Task:
Improve the inspection timeline visualization.

It should show:
- inspection date
- raw score
- grade marker
- critical violation marker
- repeat pattern marker
- visual trend

Constraints:
- Use the existing Inspection type.
- Do not invent fields.
- Do not add dependencies.
- Make it responsive.
- Keep labels clear and calm.
```

## Prompt For Claude: Product Review

```txt
Review Sano as a senior product and engineering advisor.

Context:
Sano is a one-week, three-person capstone app. It interprets official restaurant inspection history and shows popularity metadata only when a real source exists.

North Star:
We are not building "a restaurant app." We are building one polished proof that inspection history contains useful context hidden by public grades.

Review:
- README.md
- docs/PRD.md
- docs/DATA_PLAN.md
- docs/SPRINT_PLAN.md

Tell me:
1. What is unclear.
2. What sounds like scope creep.
3. What sounds legally or ethically risky.
4. What should be tightened for presentation.
5. A better 60-second opening.

Constraints:
- Do not add new features.
- Do not make it a startup pitch.
- Keep it realistic for one week.
```

## What Not To Do

- Do not ask multiple agents to build the full app independently.
- Do not let multiple agents edit the same file at the same time.
- Do not let any agent add dependencies without review.
- Do not let any agent invent official data.
- Do not merge generated code without running the app.
