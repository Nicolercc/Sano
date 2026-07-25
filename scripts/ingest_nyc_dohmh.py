#!/usr/bin/env python3
"""Normalize NYC DOHMH inspection rows into restaurant-grouped records.

The script accepts either a local CSV export or a Socrata JSON endpoint response.
It does not run during page load; it prepares stable files for the app/data layer.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

NYC_DOHMH_ENDPOINT = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"


def clean(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def as_int(value: Any, default: int = 0) -> int:
    try:
        return int(float(clean(value)))
    except (TypeError, ValueError):
        return default


def as_optional_int(value: Any) -> int | None:
    text = clean(value)
    if not text:
        return None
    try:
        return int(float(text))
    except (TypeError, ValueError):
        return None


def as_optional_float(value: Any) -> float | None:
    text = clean(value)
    if not text:
        return None
    try:
        return float(text)
    except (TypeError, ValueError):
        return None


def load_csv(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def build_fetch_url(limit: int, borough: str | None) -> str:
    params = {
        "$limit": str(limit),
        "$order": "inspection_date DESC",
    }
    if borough:
        params["boro"] = borough
    return f"{NYC_DOHMH_ENDPOINT}?{urllib.parse.urlencode(params)}"


def fetch_rows(limit: int, borough: str | None) -> tuple[list[dict[str, Any]], str]:
    url = build_fetch_url(limit, borough)
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8")), url


def row_value(row: dict[str, Any], *names: str) -> str:
    lowered = {key.lower(): value for key, value in row.items()}
    for name in names:
        value = lowered.get(name.lower())
        if value not in (None, ""):
            return clean(value)
    return ""


def normalize(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}
    inspections_by_restaurant: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)

    for row in rows:
        camis = row_value(row, "camis", "CAMIS")
        name = row_value(row, "dba", "DBA")
        if not camis or not name:
            continue

        borough = row_value(row, "boro", "BORO")
        building = row_value(row, "building", "BUILDING")
        street = row_value(row, "street", "STREET")
        zipcode = row_value(row, "zipcode", "ZIPCODE")
        cuisine = row_value(row, "cuisine_description", "CUISINE DESCRIPTION")
        inspection_date = row_value(row, "inspection_date", "INSPECTION DATE")[:10]
        score = as_optional_int(row_value(row, "score", "SCORE"))
        grade = row_value(row, "grade", "GRADE") or "Pending"
        violation_code = row_value(row, "violation_code", "VIOLATION CODE")
        violation_description = row_value(
            row, "violation_description", "VIOLATION DESCRIPTION"
        )
        critical_flag = row_value(row, "critical_flag", "CRITICAL FLAG").lower()
        is_critical = "critical" in critical_flag and "not" not in critical_flag
        latitude = as_optional_float(row_value(row, "latitude", "Latitude"))
        longitude = as_optional_float(row_value(row, "longitude", "Longitude"))

        grouped.setdefault(
            camis,
            {
                "id": camis,
                "camis": camis,
                "name": name.title(),
                "cuisine": cuisine.title() if cuisine else "Restaurant",
                "borough": borough.title(),
                "address": " ".join(part for part in [building, street.title()] if part),
                "zipcode": zipcode,
                "latitude": latitude,
                "longitude": longitude,
                "inspections": [],
            },
        )

        if not inspection_date or score is None:
            continue

        inspection_id = f"{camis}-{inspection_date}"
        inspection = inspections_by_restaurant[camis].setdefault(
            inspection_id,
            {
                "id": inspection_id,
                "date": inspection_date,
                "score": score,
                "grade": grade,
                "criticalCount": 0,
                "violationCodes": [],
                "violationDescriptions": [],
            },
        )

        if is_critical:
            inspection["criticalCount"] += 1
        if violation_code and violation_code not in inspection["violationCodes"]:
            inspection["violationCodes"].append(violation_code)
        if violation_description:
            inspection["violationDescriptions"].append(violation_description)

    for camis, inspections in inspections_by_restaurant.items():
        grouped[camis]["inspections"] = sorted(
            inspections.values(), key=lambda item: item["date"]
        )

    return sorted(
        (record for record in grouped.values() if record["inspections"]),
        key=lambda item: item["name"],
    )


def write_provenance(
    path: Path,
    *,
    source: str,
    source_url: str | None,
    input_path: Path | None,
    output_path: Path,
    row_count: int,
    restaurant_count: int,
) -> None:
    provenance = {
        "sourceName": "NYC DOHMH Restaurant Inspection Results",
        "source": source,
        "sourceUrl": source_url,
        "inputPath": str(input_path) if input_path else None,
        "outputPath": str(output_path),
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "inputRowCount": row_count,
        "normalizedRestaurantCount": restaurant_count,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(provenance, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="Local NYC DOHMH CSV export")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/generated/normalized-inspections.json"),
        help="Destination JSON path",
    )
    parser.add_argument(
        "--provenance-output",
        type=Path,
        default=Path("data/generated/provenance.json"),
        help="Destination provenance JSON path",
    )
    parser.add_argument("--limit", type=int, default=5000)
    parser.add_argument("--borough", help="Optional Socrata borough filter")
    args = parser.parse_args()

    if args.input:
        rows = load_csv(args.input)
        source_url = None
        source = "local-csv"
    else:
        rows, source_url = fetch_rows(args.limit, args.borough)
        source = "socrata-api"

    normalized = normalize(rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(normalized, indent=2), encoding="utf-8")
    write_provenance(
        args.provenance_output,
        source=source,
        source_url=source_url,
        input_path=args.input,
        output_path=args.output,
        row_count=len(rows),
        restaurant_count=len(normalized),
    )
    print(f"Wrote {len(normalized)} restaurants to {args.output}")
    print(f"Wrote provenance to {args.provenance_output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
