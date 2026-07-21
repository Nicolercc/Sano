# GitHub Setup

Use this after pushing the repository to GitHub.

## Repository Settings

Recommended settings:

1. Default branch: `main`.
2. Require pull requests before merging into `main`.
3. Require at least one review when possible.
4. Delete branches after merge.
5. Use issues to track work.

For a one-week capstone, do not overconfigure the repo so much that the team gets blocked. The important rule is simple: no direct pushes to `main`.

## Suggested Labels

Create these labels:

- `priority:p0`
- `priority:p1`
- `type:feature`
- `type:bug`
- `type:docs`
- `area:frontend`
- `area:data`
- `area:visualization`
- `area:infra`
- `area:docs`
- `status:blocked`

## Suggested Milestones

Create one milestone:

```txt
One-Week MVP
```

Due date: final presentation date.

## Suggested Project Columns

Use a simple board:

1. Backlog
2. Ready
3. In Progress
4. In Review
5. Done

## First Issues To Create

Create issues from `docs/TASK_BREAKDOWN.md`.

Start with:

1. Scaffold Next.js app.
2. Define shared TypeScript types.
3. Create real-data seed.
4. Build search shell.
5. Build restaurant cards.
6. Build restaurant profile.
7. Build trust timeline.
8. Build methodology page.
9. Deploy to Vercel.
10. Final QA and demo script.

## Pull Request Rule

Every PR should answer:

1. What changed?
2. Why?
3. How was it tested?
4. Which files are risky or shared?

## Merge Timing

Merge small work daily. A branch that lives for three days in a one-week project is too large unless it is isolated documentation.

