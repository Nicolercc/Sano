#!/usr/bin/env python3
"""Score normalized restaurant records into the app-ready Sano seed shape."""

from __future__ import annotations

import argparse
import json
import math
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any


BOROUGH_COORDINATES = {
    "Bronx": (40.8448, -73.8648),
    "Brooklyn": (40.6782, -73.9442),
    "Manhattan": (40.7831, -73.9712),
    "Queens": (40.7282, -73.7949),
    "Staten Island": (40.5795, -74.1502),
    "Nyc": (40.7128, -74.0060),
}

NEIGHBORHOOD_BY_ZIP = {
    "10001": "Chelsea",
    "10002": "Lower East Side",
    "10003": "East Village",
    "10009": "East Village",
    "10010": "Flatiron",
    "10011": "Chelsea",
    "10012": "SoHo",
    "10013": "Tribeca",
    "10014": "West Village",
    "10016": "Murray Hill",
    "10019": "Midtown West",
    "10022": "Midtown East",
    "10023": "Upper West Side",
    "10024": "Upper West Side",
    "10025": "Upper West Side",
    "10026": "Harlem",
    "10027": "Morningside Heights",
    "10028": "Upper East Side",
    "10029": "East Harlem",
    "10031": "Hamilton Heights",
    "10032": "Washington Heights",
    "10033": "Washington Heights",
    "10036": "Times Square",
    "10038": "Financial District",
    "10065": "Upper East Side",
    "10075": "Upper East Side",
    "10128": "Carnegie Hill",
    "10451": "Concourse",
    "10454": "Mott Haven",
    "10458": "Belmont",
    "10461": "Pelham Bay",
    "10463": "Riverdale",
    "10467": "Norwood",
    "11201": "Brooklyn Heights",
    "11205": "Fort Greene",
    "11206": "Williamsburg",
    "11211": "Williamsburg",
    "11215": "Park Slope",
    "11217": "Boerum Hill",
    "11218": "Kensington",
    "11220": "Sunset Park",
    "11221": "Bushwick",
    "11222": "Greenpoint",
    "11225": "Prospect Lefferts Gardens",
    "11226": "Flatbush",
    "11231": "Carroll Gardens",
    "11232": "Sunset Park",
    "11237": "Bushwick",
    "11238": "Prospect Heights",
    "11101": "Long Island City",
    "11103": "Astoria",
    "11106": "Astoria",
    "11354": "Flushing",
    "11372": "Jackson Heights",
    "11373": "Elmhurst",
    "11375": "Forest Hills",
    "11377": "Woodside",
    "11432": "Jamaica",
    "11694": "Rockaway Park",
    "10301": "St. George",
    "10306": "New Dorp",
}

GRADE_MAP = {
    "A": "A",
    "B": "B",
    "C": "C",
    "N": "Not Yet Graded",
    "P": "Pending",
    "Z": "Pending",
    "": "Pending",
}

OFFICIAL_SOURCE_NOTE = (
    "Generated from normalized NYC DOHMH inspection records. "
    "Popularity and price metadata are unavailable in the official inspection source."
)


def clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return round(min(maximum, max(minimum, value)))


def trajectory(inspections: list[dict[str, Any]]) -> str:
    if len(inspections) < 3:
        return "stable"
    ordered = sorted(inspections, key=lambda item: item["date"])
    scores = [int(item.get("score") or 0) for item in ordered]
    swings = [abs(scores[index] - scores[index - 1]) for index in range(1, len(scores))]
    if any(swing >= 12 for swing in swings):
        return "volatile"
    midpoint = math.ceil(len(scores) / 2)
    first = sum(scores[:midpoint]) / len(scores[:midpoint])
    second_values = scores[len(scores) // 2 :]
    second = sum(second_values) / len(second_values)
    if second <= first - 4:
        return "improving"
    if second >= first + 4:
        return "declining"
    return "stable"


def reliability_score(inspections: list[dict[str, Any]]) -> int:
    if not inspections:
        return 0
    ordered = sorted(inspections, key=lambda item: item["date"], reverse=True)
    recent = ordered[0]
    average = sum(int(item.get("score") or 0) for item in ordered) / len(ordered)
    critical_penalty = sum(int(item.get("criticalCount") or 0) * 4 for item in ordered)
    repeat_penalty = sum(1 for item in ordered if item.get("repeatPattern")) * 5
    volatility_penalty = 12 if trajectory(ordered) == "volatile" else 0
    improvement_bonus = 7 if trajectory(ordered) == "improving" else 0
    return clamp(
        100
        - average * 1.7
        - int(recent.get("score") or 0) * 0.6
        - critical_penalty
        - repeat_penalty
        - volatility_penalty
        + improvement_bonus
    )


def confidence(inspections: list[dict[str, Any]]) -> str:
    if len(inspections) >= 5:
        return "high"
    if len(inspections) >= 3:
        return "medium"
    return "limited"


def normalize_grade(value: Any) -> str:
    grade = str(value or "").strip().upper()
    return GRADE_MAP.get(grade, "Pending")


def label(score: int, trend: str, confidence_value: str, recent_critical: bool) -> str:
    if recent_critical:
        return "Recent critical flag"
    if confidence_value == "limited":
        return "Limited data"
    if trend == "volatile" or score < 62:
        return "Volatile history"
    if trend == "improving":
        return "Improving record"
    return "Consistent record"


def repeat_patterns(inspections: list[dict[str, Any]]) -> None:
    seen: set[str] = set()
    repeated: set[str] = set()
    for inspection in inspections:
        for code in inspection.get("violationCodes", []):
            if code in seen:
                repeated.add(code)
            seen.add(code)
    for inspection in inspections:
        codes = set(inspection.get("violationCodes", []))
        inspection["repeatPattern"] = bool(codes & repeated)
        inspection["note"] = (
            "Inspection cycle includes a repeated violation-code pattern."
            if inspection["repeatPattern"]
            else "Inspection cycle has no repeated pattern in this prepared extract."
        )


def slug(value: str) -> str:
    normalized = "".join(
        character.lower() if character.isalnum() else "-" for character in value.strip()
    )
    return "-".join(part for part in normalized.split("-") if part)


def coordinates(record: dict[str, Any]) -> tuple[float, float, str]:
    latitude = record.get("latitude")
    longitude = record.get("longitude")
    if latitude is not None and longitude is not None:
        return float(latitude), float(longitude), "official-record"

    borough = str(record.get("borough") or "Nyc")
    fallback = BOROUGH_COORDINATES.get(borough, BOROUGH_COORDINATES["Nyc"])
    return fallback[0], fallback[1], "borough-centroid-fallback"


def build_app_record(record: dict[str, Any], data_as_of: str) -> dict[str, Any]:
    inspections = record.get("inspections", [])
    repeat_patterns(inspections)
    for inspection in inspections:
        inspection["grade"] = normalize_grade(inspection.get("grade"))
    score = reliability_score(inspections)
    trend = trajectory(inspections)
    conf = confidence(inspections)
    recent_critical = any(
        int(item.get("criticalCount") or 0) > 0
        for item in sorted(inspections, key=lambda item: item["date"], reverse=True)[:2]
    )
    current_grade = (
        normalize_grade(
            sorted(inspections, key=lambda item: item["date"], reverse=True)[0].get("grade")
        )
        if inspections
        else "Pending"
    )
    latitude, longitude, coordinate_source = coordinates(record)
    zipcode = str(record.get("zipcode") or "").strip()
    source_note = OFFICIAL_SOURCE_NOTE
    if coordinate_source != "official-record":
        source_note += " Coordinates use a borough-centroid fallback."

    return {
        "id": slug(str(record["id"])),
        "name": record["name"],
        "cuisine": record.get("cuisine") or "Restaurant",
        "neighborhood": record.get("neighborhood") or NEIGHBORHOOD_BY_ZIP.get(zipcode) or record.get("borough") or "NYC",
        "borough": record.get("borough") or "NYC",
        "address": record.get("address") or "",
        "zipcode": zipcode or None,
        "latitude": latitude,
        "longitude": longitude,
        "rating": None,
        "reviewCount": None,
        "priceLevel": None,
        "grade": current_grade or "Pending",
        "inspectionReliabilityScore": score,
        "trajectory": trend,
        "trustGap": None,
        "confidence": conf,
        "sanoLabel": label(score, trend, conf, recent_critical),
        "explanation": "Derived from inspection score burden, critical flags, repeat patterns, volatility, and trend.",
        "dataAsOf": data_as_of,
        "inspections": inspections,
        "alternatives": record.get("alternatives") or [],
        "sourceNotes": source_note,
        "metadataAvailability": {
            "popularity": False,
            "price": False,
            "trustGap": False,
        },
    }


def current_grade(record: dict[str, Any]) -> str:
    inspections = record.get("inspections", [])
    if not inspections:
        return "Pending"
    recent = sorted(inspections, key=lambda item: item["date"], reverse=True)[0]
    return normalize_grade(recent.get("grade"))


def curation_score(record: dict[str, Any]) -> int:
    inspections = record.get("inspections", [])
    if not inspections:
        return -100

    sorted_inspections = sorted(inspections, key=lambda item: item["date"], reverse=True)
    grade = current_grade(record)
    scores = [int(item.get("score") or 0) for item in inspections]
    non_zero_score_count = sum(1 for score in scores if score > 0)
    critical_count = sum(int(item.get("criticalCount") or 0) for item in inspections)
    zip_bonus = 8 if str(record.get("zipcode") or "").strip() in NEIGHBORHOOD_BY_ZIP else 0
    grade_bonus = {"A": 18, "B": 12, "C": 8, "Pending": -8, "Not Yet Graded": -10}.get(grade, 0)
    confidence_bonus = min(len(inspections), 6) * 5
    history_bonus = min(non_zero_score_count, 5) * 4
    critical_penalty = min(critical_count * 2, 10)
    recency_bonus = 6 if sorted_inspections[0].get("date", "") >= "2024-01-01" else 0
    pending_penalty = 24 if grade == "Pending" else 0
    zero_recent_penalty = 8 if int(sorted_inspections[0].get("score") or 0) == 0 else 0

    return (
        confidence_bonus
        + history_bonus
        + grade_bonus
        + recency_bonus
        + zip_bonus
        - critical_penalty
        - pending_penalty
        - zero_recent_penalty
    )


def select_curated_records(records: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    selected: list[dict[str, Any]] = []
    seen_names: set[str] = set()
    borough_counts: dict[str, int] = {}
    cuisine_counts: dict[str, int] = {}
    trajectory_counts: dict[str, int] = {}
    grade_counts: dict[str, int] = {}
    recent_critical_count = 0

    ranked = sorted(
        records,
        key=lambda record: (
            curation_score(record),
            len(record.get("inspections", [])),
            record.get("name", ""),
        ),
        reverse=True,
    )

    for record in ranked:
        normalized_name = str(record.get("name", "")).lower()
        borough = str(record.get("borough") or "NYC")
        cuisine = str(record.get("cuisine") or "Restaurant")
        trend = trajectory(record.get("inspections", []))
        grade = current_grade(record)
        has_recent_critical = any(
            int(item.get("criticalCount") or 0) > 0
            for item in sorted(record.get("inspections", []), key=lambda item: item["date"], reverse=True)[:2]
        )

        if normalized_name in seen_names:
            continue
        if borough_counts.get(borough, 0) >= max(3, math.ceil(limit / 3)):
            continue
        if cuisine_counts.get(cuisine, 0) >= max(2, math.ceil(limit / 5)):
            continue
        if trajectory_counts.get(trend, 0) >= max(3, math.ceil(limit / 3)):
            continue
        if grade == "Pending" and grade_counts.get("Pending", 0) >= max(3, math.ceil(limit / 4)):
            continue
        if has_recent_critical and recent_critical_count >= max(4, math.ceil(limit * 0.45)):
            continue

        selected.append(record)
        seen_names.add(normalized_name)
        borough_counts[borough] = borough_counts.get(borough, 0) + 1
        cuisine_counts[cuisine] = cuisine_counts.get(cuisine, 0) + 1
        trajectory_counts[trend] = trajectory_counts.get(trend, 0) + 1
        grade_counts[grade] = grade_counts.get(grade, 0) + 1
        if has_recent_critical:
            recent_critical_count += 1

        if len(selected) == limit:
            return selected

    for record in ranked:
        normalized_name = str(record.get("name", "")).lower()
        if normalized_name in seen_names:
            continue
        selected.append(record)
        seen_names.add(normalized_name)
        if len(selected) == limit:
            return selected

    return selected


def add_alternatives(records: list[dict[str, Any]], count: int = 2) -> None:
    for record in records:
        candidates = [
            candidate
            for candidate in records
            if candidate["id"] != record["id"]
            and (
                candidate["borough"] == record["borough"]
                or candidate["cuisine"] == record["cuisine"]
            )
        ]
        ranked = sorted(
            candidates,
            key=lambda item: item["inspectionReliabilityScore"],
            reverse=True,
        )
        record["alternatives"] = [candidate["id"] for candidate in ranked[:count]]


def write_provenance(
    path: Path,
    *,
    input_path: Path,
    output_path: Path,
    input_count: int,
    output_count: int,
    data_as_of: str,
) -> None:
    upstream_provenance_path = input_path.parent / "provenance.json"
    upstream_provenance = None
    if upstream_provenance_path.exists():
        upstream_provenance = json.loads(upstream_provenance_path.read_text(encoding="utf-8"))

    provenance = {
        "sourceName": "NYC DOHMH Restaurant Inspection Results",
        "source": "normalized-official-records",
        "mode": "official-generated-seed",
        "inputPath": str(input_path),
        "outputPath": str(output_path),
        "scoredAt": datetime.now(timezone.utc).isoformat(),
        "dataAsOf": data_as_of,
        "inputRestaurantCount": input_count,
        "scoredRestaurantCount": output_count,
        "upstreamProvenance": upstream_provenance,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(provenance, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/generated/normalized-inspections.json"),
        help="Normalized restaurant JSON from ingest_nyc_dohmh.py",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/generated/official-restaurants.json"),
        help="App-ready seed JSON",
    )
    parser.add_argument(
        "--provenance-output",
        type=Path,
        default=Path("data/generated/scoring-provenance.json"),
        help="Destination scoring provenance JSON path",
    )
    parser.add_argument("--min-inspections", type=int, default=2)
    parser.add_argument("--limit", type=int, default=25)
    parser.add_argument("--data-as-of", default=date.today().isoformat())
    args = parser.parse_args()

    records = json.loads(args.input.read_text(encoding="utf-8"))
    eligible_records = [
        record
        for record in records
        if len(record.get("inspections", [])) >= args.min_inspections
        and record.get("name")
        and record.get("address")
    ]
    curated_records = select_curated_records(eligible_records, args.limit)
    app_records = [
        build_app_record(record, args.data_as_of)
        for record in curated_records
    ]
    add_alternatives(app_records)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(app_records, indent=2), encoding="utf-8")
    write_provenance(
        args.provenance_output,
        input_path=args.input,
        output_path=args.output,
        input_count=len(records),
        output_count=len(app_records),
        data_as_of=args.data_as_of,
    )
    print(f"Wrote {len(app_records)} scored restaurants to {args.output}")
    print(f"Wrote scoring provenance to {args.provenance_output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
