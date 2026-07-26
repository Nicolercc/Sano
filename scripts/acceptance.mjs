const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const SUPPORTED_REAL_DATA_MODES = new Set([
  "official-generated-seed",
  "supabase-app-records"
]);
const MIN_SUPABASE_RESTAURANTS = 1000;
const FORBIDDEN_PROFILE_STRINGS = [
  "0.0 rating",
  "0 reviews",
  "hand-authored seed",
  "not live extracts"
];
const FORBIDDEN_HOME_STRINGS = ["This is not a fake map"];
const FORBIDDEN_DEFAULT_RESULT_NAMES = ["Google 5Bb"];

function normalizeBaseUrl(value) {
  const raw = value || DEFAULT_BASE_URL;
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchJson(baseUrl, path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      accept: "application/json"
    }
  });
  const contentType = response.headers.get("content-type") || "";

  assert(
    response.status === expectedStatus,
    `${path} returned ${response.status}; expected ${expectedStatus}`
  );
  assert(
    contentType.includes("application/json"),
    `${path} returned ${contentType || "no content-type"}; expected JSON`
  );

  return response.json();
}

async function fetchText(baseUrl, path, allowedStatuses = [200]) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();

  assert(
    allowedStatuses.includes(response.status),
    `${path} returned ${response.status}; expected ${allowedStatuses.join(" or ")}`
  );

  return text;
}

function chooseShowcaseRestaurant(restaurants) {
  return (
    restaurants.find(
      (restaurant) =>
        restaurant.inspectionReliabilityScore >= 60 &&
        restaurant.confidence !== "low"
    ) ||
    restaurants.find((restaurant) => restaurant.inspectionReliabilityScore >= 45) ||
    restaurants[0]
  );
}

function hasRecentCriticalFlag(restaurant) {
  return [...restaurant.inspections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2)
    .some((inspection) => inspection.criticalCount > 0);
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.SANO_BASE_URL);
  const health = await fetchJson(baseUrl, "/api/health");

  assert(health.status === "ok", "/api/health did not report ok");
  assert(
    SUPPORTED_REAL_DATA_MODES.has(health.data?.mode),
    `/api/health mode is ${health.data?.mode}; expected one of ${[
      ...SUPPORTED_REAL_DATA_MODES
    ].join(", ")}`
  );
  assert(
    Number.isInteger(health.data?.restaurantCount) &&
      health.data.restaurantCount > 0,
    "/api/health restaurantCount is missing or empty"
  );
  if (health.data.mode === "supabase-app-records") {
    assert(
      health.data.restaurantCount >= MIN_SUPABASE_RESTAURANTS,
      `/api/health Supabase restaurantCount is ${health.data.restaurantCount}; expected at least ${MIN_SUPABASE_RESTAURANTS}`
    );
  }

  const restaurantPayload = await fetchJson(baseUrl, "/api/restaurants");
  assert(
    Number.isInteger(restaurantPayload.count) && restaurantPayload.count > 0,
    `/api/restaurants count ${restaurantPayload.count} is missing or empty`
  );
  assert(
    Array.isArray(restaurantPayload.restaurants) &&
      restaurantPayload.restaurants.length === restaurantPayload.count,
    "/api/restaurants payload shape is invalid"
  );
  assert(
    restaurantPayload.count <= health.data.restaurantCount,
    `/api/restaurants returned ${restaurantPayload.count}, which exceeds health total ${health.data.restaurantCount}`
  );
  for (const forbiddenName of FORBIDDEN_DEFAULT_RESULT_NAMES) {
    assert(
      !restaurantPayload.restaurants.some(
        (restaurant) => restaurant.name === forbiddenName
      ),
      `/api/restaurants default results include demo-hostile record: ${forbiddenName}`
    );
  }
  assert(
    restaurantPayload.restaurants.every((restaurant) => {
      const availability = restaurant.metadataAvailability;
      const popularityIsConsistent = availability?.popularity
        ? restaurant.rating !== null && restaurant.reviewCount !== null
        : restaurant.rating === null && restaurant.reviewCount === null;
      const priceIsConsistent = availability?.price
        ? restaurant.priceLevel !== null
        : restaurant.priceLevel === null;
      const trustGapIsConsistent = availability?.trustGap
        ? restaurant.trustGap !== null
        : restaurant.trustGap === null;

      return popularityIsConsistent && priceIsConsistent && trustGapIsConsistent;
    }),
    "/api/restaurants metadata availability flags do not match exposed values"
  );

  const showcase = chooseShowcaseRestaurant(restaurantPayload.restaurants);
  assert(showcase?.id && showcase?.name, "No showcase restaurant available");

  const searchPayload = await fetchJson(
    baseUrl,
    `/api/restaurants?q=${encodeURIComponent(showcase.name)}&limit=10`
  );
  assert(
    searchPayload.restaurants.some((restaurant) => restaurant.id === showcase.id),
    `/api/restaurants search did not return showcase restaurant ${showcase.id}`
  );

  const criticalPayload = await fetchJson(
    baseUrl,
    "/api/restaurants?recentCriticalOnly=true&limit=10"
  );
  assert(
    criticalPayload.restaurants.length > 0 &&
      criticalPayload.restaurants.every(hasRecentCriticalFlag),
    "/api/restaurants recentCriticalOnly filter returned non-critical records"
  );

  const noMatchPayload = await fetchJson(
    baseUrl,
    "/api/restaurants?q=sano-guaranteed-no-match-zzzz&limit=10"
  );
  assert(
    noMatchPayload.count === 0 && noMatchPayload.restaurants.length === 0,
    "/api/restaurants no-match search fell through to fallback results"
  );

  if (health.data.mode === "supabase-app-records") {
    const zipPayload = await fetchJson(baseUrl, "/api/restaurants?q=11414&limit=10");
    assert(
      zipPayload.restaurants.some((restaurant) => restaurant.zipcode === "11414"),
      "/api/restaurants ZIP search for 11414 did not return a matching ZIP record"
    );
  }

  const home = await fetchText(baseUrl, "/");
  assert(
    home.includes("Every restaurant has a grade. Not every grade tells the same story."),
    "Home page does not include the demo-ready hero message"
  );
  for (const forbidden of FORBIDDEN_HOME_STRINGS) {
    assert(
      !home.includes(forbidden),
      `Home page contains forbidden demo string: ${forbidden}`
    );
  }
  assert(
    home.includes(showcase.name) ||
      restaurantPayload.restaurants.some((restaurant) =>
        home.includes(restaurant.name)
      ),
    "Home page does not include official restaurant names"
  );

  const profile = await fetchText(baseUrl, `/restaurants/${showcase.id}`);
  assert(
    profile.includes(showcase.name),
    `Profile page for ${showcase.id} does not include ${showcase.name}`
  );

  const unmatchedPopularity = restaurantPayload.restaurants.find(
    (restaurant) => restaurant.metadataAvailability?.popularity === false
  );
  if (unmatchedPopularity) {
    const unmatchedProfile = await fetchText(
      baseUrl,
      `/restaurants/${unmatchedPopularity.id}`
    );
    assert(
      unmatchedProfile.includes("Not matched yet") ||
        unmatchedProfile.includes("No public rating match yet") ||
        unmatchedProfile.includes("Popularity data pending") ||
        unmatchedProfile.includes("Review data not matched yet"),
      "Profile page does not disclose unmatched popularity metadata"
    );
  }

  for (const forbidden of FORBIDDEN_PROFILE_STRINGS) {
    assert(
      !profile.includes(forbidden),
      `Profile page contains forbidden demo string: ${forbidden}`
    );
  }

  await fetchJson(baseUrl, "/api/restaurants/not-a-real-restaurant", 404);

  const missingProfile = await fetchText(
    baseUrl,
    "/restaurants/not-a-real-restaurant",
    [404]
  );
  assert(
    missingProfile.includes("Restaurant unavailable") ||
      missingProfile.includes("could not find that restaurant"),
    "Missing restaurant profile does not render a controlled response"
  );

  const methodology = await fetchText(baseUrl, "/methodology");
  assert(
    methodology.includes("Official data disclosure") &&
      methodology.includes("not comprehensive citywide coverage"),
    "Methodology page does not include official-mode limitations"
  );

  console.log(`Acceptance passed for ${baseUrl}`);
  console.log(
    `Mode: ${health.data.mode}; restaurants: ${restaurantPayload.count}; showcase: ${showcase.name} (${showcase.id})`
  );
}

main().catch((error) => {
  console.error(`Acceptance failed: ${error.message}`);
  process.exit(1);
});
