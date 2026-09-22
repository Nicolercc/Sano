import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function checkFilterFocusStyles() {
  const source = read("components/FilterBar.tsx");
  const helperMatch = source.match(
    /const filterControlFocusClass =\s+"([^"]+)"/
  );

  assert(helperMatch, "FilterBar is missing filterControlFocusClass.");

  const helper = helperMatch[1];
  for (const token of [
    "focus-visible:border-moss",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-moss"
  ]) {
    assert(
      helper.includes(token),
      `filterControlFocusClass is missing ${token}.`
    );
  }

  assert(
    count(source, /\$\{filterControlFocusClass\}/g) >= 4,
    "Filter input/select controls must all reuse filterControlFocusClass."
  );
}

function checkHeroSearchFocusHandoff() {
  const source = read("components/SearchShell.tsx");

  assert(
    source.includes("searchRegionFocusRef"),
    "SearchShell is missing the focus target for hero search handoff."
  );
  assert(
    source.includes("tabIndex={-1}"),
    "Search region focus target must be programmatically focusable."
  );
  assert(
    /runHeroSearch[\s\S]*searchRegionFocusRef\.current\?\.focus\(\{\s*preventScroll:\s*true\s*\}\)/.test(
      source
    ),
    "runHeroSearch must move focus into the search/results region after submit."
  );
  assert(
    /focus-visible:outline[^"]*focus-visible:outline-moss/.test(source),
    "Search focus target must have a visible focus style."
  );
}

function checkSearchStatusRegion() {
  const source = read("components/SearchShell.tsx");

  assert(
    count(source, /aria-live="polite"/g) === 1,
    "SearchShell must render exactly one polite live region."
  );
  assert(
    count(source, /id="search-status"/g) === 1,
    "SearchShell must render exactly one #search-status region."
  );
  assert(
    source.includes("searchStatusMessage"),
    "SearchShell must derive a concise searchStatusMessage."
  );
  for (const token of ["loading", "loadError", "results.length"]) {
    assert(
      source.includes(token),
      `searchStatusMessage must account for ${token}.`
    );
  }
}

function main() {
  checkFilterFocusStyles();
  checkHeroSearchFocusHandoff();
  checkSearchStatusRegion();
  console.log("Accessibility regression checks passed.");
}

main();
