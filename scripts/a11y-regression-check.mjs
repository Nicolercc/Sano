import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readSourceTree(paths) {
  const sources = [];

  function visit(relativePath) {
    const absolutePath = join(root, relativePath);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      for (const entry of readdirSync(absolutePath)) {
        visit(join(relativePath, entry));
      }
      return;
    }

    if (/\.(tsx?|jsx?)$/.test(relativePath)) {
      sources.push({
        path: relativePath,
        source: readFileSync(absolutePath, "utf8")
      });
    }
  }

  for (const path of paths) {
    visit(path);
  }

  return sources;
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
  const appSources = readSourceTree(["app", "components"]);
  const combinedSource = appSources.map(({ source }) => source).join("\n");

  assert(
    count(combinedSource, /aria-live="polite"/g) === 1,
    "The app/components tree must render exactly one polite live region."
  );
  assert(
    count(combinedSource, /id="search-status"/g) === 1,
    "The app/components tree must render exactly one #search-status region."
  );
  assert(
    source.includes("searchStatusMessage"),
    "SearchShell must derive a concise searchStatusMessage."
  );
  assert(
    source.includes("LIVE_STATUS_QUERY_DEBOUNCE_MS = 500"),
    "Search live status query announcements must keep a 500ms debounce."
  );
  assert(
    source.includes("announcedSearchStatusMessage"),
    "SearchShell must render a debounced announcedSearchStatusMessage."
  );
  assert(
    /setTimeout\(\(\) => \{[\s\S]*setAnnouncedSearchStatusMessage\(searchStatusMessage\)/.test(
      source
    ),
    "SearchShell must debounce live status announcements before updating the live region."
  );
  assert(
    /aria-atomic="true"[\s\S]*\{announcedSearchStatusMessage\}/.test(source),
    "The search status live region must render the debounced status message."
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
