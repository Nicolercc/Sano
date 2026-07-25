const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const EXPECTED_MODE = "official-generated-seed";
const FORBIDDEN_PROFILE_STRINGS = [
  "0.0 rating",
  "0 reviews",
  "hand-authored seed",
  "not live extracts"
];

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

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.SANO_BASE_URL);
  const health = await fetchJson(baseUrl, "/api/health");

  assert(health.status === "ok", "/api/health did not report ok");
  assert(
    health.data?.mode === EXPECTED_MODE,
    `/api/health mode is ${health.data?.mode}; expected ${EXPECTED_MODE}`
  );
  assert(
    Number.isInteger(health.data?.restaurantCount) &&
      health.data.restaurantCount > 0,
    "/api/health restaurantCount is missing or empty"
  );

  const restaurantPayload = await fetchJson(baseUrl, "/api/restaurants");
  assert(
    restaurantPayload.count === health.data.restaurantCount,
    `/api/restaurants count ${restaurantPayload.count} does not match health ${health.data.restaurantCount}`
  );
  assert(
    Array.isArray(restaurantPayload.restaurants) &&
      restaurantPayload.restaurants.length === restaurantPayload.count,
    "/api/restaurants payload shape is invalid"
  );
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

  const home = await fetchText(baseUrl, "/");
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
  assert(
    profile.includes("Unavailable") || profile.includes("Public rating unavailable"),
    "Profile page does not disclose unavailable popularity metadata"
  );

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
