#!/usr/bin/env python3
"""Load app-ready Sano restaurant records into Supabase.

Required environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY

The table must exist first. Apply `supabase/schema.sql` in Supabase SQL editor
or with psql before running this loader.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def load_local_env(path: Path = Path(".env")) -> None:
    if not path.exists():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def require_supabase_config() -> tuple[str, str]:
    load_local_env()
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
        "SUPABASE_ANON_KEY"
    )

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY are required"
        )

    return url, key


def recent_critical(record: dict[str, Any]) -> bool:
    inspections = sorted(
        record.get("inspections", []),
        key=lambda inspection: inspection.get("date") or "",
    )
    if not inspections:
        return False
    return int(inspections[-1].get("criticalCount") or 0) > 0


def build_search_text(record: dict[str, Any]) -> str:
    parts = [
        record.get("name"),
        record.get("cuisine"),
        record.get("neighborhood"),
        record.get("borough"),
        record.get("address"),
    ]
    return " ".join(str(part).strip() for part in parts if part)


def sanitize_official_metadata(record: dict[str, Any]) -> dict[str, Any]:
    """Represent unavailable popularity data as null, never as fake zeroes."""

    sanitized = dict(record)
    sanitized["rating"] = None
    sanitized["reviewCount"] = None
    sanitized["priceLevel"] = None
    sanitized["trustGap"] = None
    sanitized["metadataAvailability"] = {
        "popularity": False,
        "price": False,
        "trustGap": False,
    }
    return sanitized


def with_place_metadata(
    record: dict[str, Any],
    metadata_by_restaurant_id: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    record = sanitize_official_metadata(record)
    metadata = metadata_by_restaurant_id.get(str(record.get("id")))
    if not metadata:
        return record

    enriched = dict(record)
    has_popularity = bool(metadata.get("rating") and metadata.get("reviewCount"))
    has_price = bool(metadata.get("priceLevel"))
    enriched["rating"] = metadata.get("rating") if has_popularity else None
    enriched["reviewCount"] = metadata.get("reviewCount") if has_popularity else None
    enriched["priceLevel"] = metadata.get("priceLevel") if has_price else None
    enriched["placeMetadata"] = metadata
    enriched["metadataAvailability"] = {
        "popularity": has_popularity,
        "price": has_price,
        "trustGap": False,
    }
    enriched["sourceNotes"] = (
        f"{record.get('sourceNotes', '').rstrip()} "
        f"Popularity metadata enriched from {metadata.get('provider')}."
    ).strip()
    return enriched


def to_supabase_row(record: dict[str, Any]) -> dict[str, Any]:
    inspections = record.get("inspections", [])
    return {
        "id": str(record["id"]),
        "name": record.get("name") or "",
        "cuisine": record.get("cuisine"),
        "neighborhood": record.get("neighborhood"),
        "borough": record.get("borough"),
        "grade": record.get("grade"),
        "trajectory": record.get("trajectory"),
        "confidence": record.get("confidence"),
        "inspection_reliability_score": record.get("inspectionReliabilityScore"),
        "recent_critical": recent_critical(record),
        "inspection_count": len(inspections),
        "data_as_of": record.get("dataAsOf"),
        "search_text": build_search_text(record),
        "payload": record,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def chunks(items: list[dict[str, Any]], size: int):
    for start in range(0, len(items), size):
        yield items[start : start + size]


def upsert_batch(url: str, key: str, rows: list[dict[str, Any]]) -> None:
    request = urllib.request.Request(
        f"{url}/rest/v1/restaurant_records?on_conflict=id",
        data=json.dumps(rows).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Prefer": "resolution=merge-duplicates",
        },
    )

    with urllib.request.urlopen(request, timeout=60) as response:
        response.read()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/generated/supabase-restaurants.json"),
        help="App-ready restaurant JSON to load",
    )
    parser.add_argument(
        "--place-metadata",
        type=Path,
        default=Path("data/place-metadata.json"),
        help="Optional reviewed Google/Yelp place metadata JSON",
    )
    parser.add_argument("--batch-size", type=int, default=100)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    records = json.loads(args.input.read_text(encoding="utf-8"))
    place_metadata = (
        json.loads(args.place_metadata.read_text(encoding="utf-8"))
        if args.place_metadata.exists()
        else []
    )
    metadata_by_restaurant_id = {
        str(metadata["restaurantId"]): metadata for metadata in place_metadata
    }
    records = [
        with_place_metadata(record, metadata_by_restaurant_id)
        for record in records
    ]
    rows = [to_supabase_row(record) for record in records]

    print(f"Prepared {len(rows)} rows from {args.input}")
    print(f"Merged {len(metadata_by_restaurant_id)} place metadata records")
    if args.dry_run:
        print(json.dumps(rows[:3], indent=2))
        return 0

    try:
        url, key = require_supabase_config()
        for index, batch in enumerate(chunks(rows, args.batch_size), start=1):
            upsert_batch(url, key, batch)
            print(f"Upserted batch {index} ({len(batch)} rows)")
    except urllib.error.HTTPError as error:
        print(error.read().decode("utf-8", errors="replace"), file=sys.stderr)
        raise
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 2

    print(f"Loaded {len(rows)} rows into Supabase restaurant_records")
    return 0


if __name__ == "__main__":
    sys.exit(main())
