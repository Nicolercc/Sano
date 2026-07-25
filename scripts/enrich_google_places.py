#!/usr/bin/env python3
"""Enrich app-ready restaurants with Google Places popularity metadata.

This script does not run during page load. It prepares a committed or reviewed
metadata file that can be merged into the repository layer.

Required environment variable:
  GOOGLE_PLACES_API_KEY
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.googleMapsUri",
        "places.businessStatus",
        "places.types",
    ]
)

PRICE_LEVEL_MAP = {
    "PRICE_LEVEL_INEXPENSIVE": "$",
    "PRICE_LEVEL_MODERATE": "$$",
    "PRICE_LEVEL_EXPENSIVE": "$$$",
    "PRICE_LEVEL_VERY_EXPENSIVE": "$$$",
}


def load_restaurants(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def build_query(restaurant: dict[str, Any]) -> str:
    parts = [
        restaurant.get("name"),
        restaurant.get("address"),
        restaurant.get("borough"),
        "NY",
        "restaurant",
    ]
    return " ".join(str(part).strip() for part in parts if part)


def normalize(text: str) -> str:
    return " ".join(text.lower().replace("&", "and").split())


def match_confidence(restaurant: dict[str, Any], place: dict[str, Any]) -> str:
    expected_name = normalize(str(restaurant.get("name") or ""))
    actual_name = normalize(place.get("displayName", {}).get("text") or "")
    expected_address = normalize(str(restaurant.get("address") or ""))
    actual_address = normalize(place.get("formattedAddress") or "")

    name_match = expected_name and (
        expected_name == actual_name
        or expected_name in actual_name
        or actual_name in expected_name
    )
    address_match = expected_address and expected_address in actual_address

    if name_match and address_match:
        return "high"
    if name_match:
        return "medium"
    return "low"


def request_google_places(api_key: str, query: str) -> list[dict[str, Any]]:
    body = json.dumps(
        {
            "textQuery": query,
            "includedType": "restaurant",
            "maxResultCount": 3,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        TEXT_SEARCH_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": FIELD_MASK,
        },
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload.get("places", [])


def metadata_from_place(
    restaurant: dict[str, Any],
    place: dict[str, Any],
    *,
    fetched_at: str,
) -> dict[str, Any]:
    price_level = PRICE_LEVEL_MAP.get(place.get("priceLevel"))
    return {
        "restaurantId": str(restaurant["id"]),
        "provider": "google-places",
        "providerPlaceId": place.get("id") or "",
        "displayName": place.get("displayName", {}).get("text") or "",
        "formattedAddress": place.get("formattedAddress") or "",
        "rating": place.get("rating"),
        "reviewCount": place.get("userRatingCount"),
        "priceLevel": price_level,
        "googleMapsUri": place.get("googleMapsUri"),
        "fetchedAt": fetched_at,
        "matchConfidence": match_confidence(restaurant, place),
    }


def enrich(
    restaurants: list[dict[str, Any]],
    *,
    api_key: str,
    limit: int | None,
    sleep_seconds: float,
) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    fetched_at = datetime.now(timezone.utc).isoformat()
    selected = restaurants[:limit] if limit else restaurants

    for index, restaurant in enumerate(selected, start=1):
        query = build_query(restaurant)
        print(f"[{index}/{len(selected)}] {restaurant.get('id')} {query}")
        try:
          places = request_google_places(api_key, query)
        except urllib.error.HTTPError as error:
          message = error.read().decode("utf-8", errors="replace")
          print(f"  Google Places HTTP {error.code}: {message}", file=sys.stderr)
          continue
        except urllib.error.URLError as error:
          print(f"  Google Places request failed: {error}", file=sys.stderr)
          continue

        if not places:
            print("  No Google Places match")
            continue

        metadata = metadata_from_place(
            restaurant,
            places[0],
            fetched_at=fetched_at,
        )
        if metadata["matchConfidence"] == "low":
            print(
                "  Low-confidence match skipped; review manually before adding",
                file=sys.stderr,
            )
            continue

        output.append(metadata)
        print(
            f"  Matched {metadata['displayName']} "
            f"rating={metadata['rating']} reviews={metadata['reviewCount']} "
            f"confidence={metadata['matchConfidence']}"
        )
        time.sleep(sleep_seconds)

    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/official-restaurants.json"),
        help="App-ready official restaurant JSON",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/place-metadata.json"),
        help="Destination metadata JSON",
    )
    parser.add_argument("--limit", type=int, help="Optional restaurant limit")
    parser.add_argument("--sleep", type=float, default=0.15, help="Delay between requests")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print Google Places queries without making network requests",
    )
    args = parser.parse_args()

    restaurants = load_restaurants(args.input)
    selected = restaurants[: args.limit] if args.limit else restaurants

    if args.dry_run:
        for restaurant in selected:
            print(f"{restaurant.get('id')}: {build_query(restaurant)}")
        return 0

    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        print("GOOGLE_PLACES_API_KEY is required unless --dry-run is used", file=sys.stderr)
        return 2

    metadata = enrich(
        restaurants,
        api_key=api_key,
        limit=args.limit,
        sleep_seconds=args.sleep,
    )
    args.output.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Wrote {len(metadata)} metadata records to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
