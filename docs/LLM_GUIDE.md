# LLM Guide

Contributors may use AI tools, but the output must stay aligned with this repository's architecture, data model, and product scope.

## Standard Context To Paste Into An LLM

```txt
We are building Sano, a one-week Next.js + TypeScript capstone app. Sano is not a generic restaurant app. It is a polished proof that inspection history contains useful context hidden by public grades.

Follow the existing repo structure. Avoid changing shared types or sample data unless requested. Do not make absolute safety claims. Use neutral inspection-history language. Build small components that fit the current architecture.
```

## Good LLM Requests

Ask for one focused thing:

```txt
Create a React component named RestaurantCard that accepts the existing Restaurant type and displays name, cuisine, neighborhood, rating, grade, Sano label, confidence, and explanation.
```

```txt
Write a TypeScript helper that formats inspection scores and trajectory labels using the existing fields. Do not change the data shape.
```

```txt
Review this methodology copy for clarity and remove any absolute safety claims.
```

## Risky LLM Requests

Avoid broad prompts like:

```txt
Build the whole app.
```

```txt
Rewrite the architecture.
```

```txt
Make the app more advanced with AI.
```

```txt
Add whatever dependencies are needed.
```

These prompts invite scope creep, invented APIs, and merge conflicts.

## Rules For AI-Generated Code

1. Review every generated line.
2. Do not accept invented data fields.
3. Do not accept invented API responses.
4. Do not change shared files unless that is the task.
5. Keep components small.
6. Preserve legal and ethical copy rules.
7. Test the app after applying AI-generated code.

## Prompt Template For Components

```txt
Create or edit [component name].

Project context:
- Next.js + TypeScript + Tailwind.
- Sano interprets restaurant inspection history.
- Do not make absolute safety claims.
- Use the existing types.

Component responsibility:
[describe one responsibility]

Inputs:
[paste relevant type or props]

Output:
[describe expected UI]

Constraints:
- Do not change unrelated files.
- Do not add dependencies.
- Keep the component accessible.
- Use neutral language.
```

## Prompt Template For Docs

```txt
Improve this project documentation for clarity.

Context:
Sano is a one-week capstone MVP that interprets official restaurant inspection history. The writing should sound professional, calm, and clear.

Rules:
- Do not add new product scope.
- Do not make absolute safety claims.
- Keep the North Star intact.
- Make the text useful to a three-person team.
```

