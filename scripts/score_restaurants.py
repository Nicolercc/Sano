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


def label(score: int, trend: str, confidence_value: str, recent_critical: bool) -> str:
    if confidence_value == "limited":
        return "Limited data"
    if recent_critical:
        return "Recent critical flag"
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
    score = reliability_score(inspections)
    trend = trajectory(inspections)
    conf = confidence(inspections)
    recent_critical = any(
        int(item.get("criticalCount") or 0) > 0
        for item in sorted(inspections, key=lambda item: item["date"], reverse=True)[:2]
    )
    current_grade = (
        sorted(inspections, key=lambda item: item["date"], reverse=True)[0].get("grade")
        if inspections
        else "Pending"
    )
    latitude, longitude, coordinate_source = coordinates(record)
    source_note = (
        "Generated from normalized NYC DOHMH inspection records. "
        "Popularity metadata is unavailable in the official inspection source."
    )
    if coordinate_source != "official-record":
        source_note += " Coordinates use a borough-centroid fallback."

    return {
        "id": slug(str(record["id"])),
        "name": record["name"],
        "cuisine": record.get("cuisine") or "Restaurant",
        "neighborhood": record.get("neighborhood") or "NYC",
        "borough": record.get("borough") or "NYC",
        "address": record.get("address") or "",
        "latitude": latitude,
        "longitude": longitude,
        "rating": float(record.get("rating") or 0),
        "reviewCount": int(record.get("reviewCount") or 0),
        "priceLevel": record.get("priceLevel") or "$$",
        "grade": current_grade or "Pending",
        "inspectionReliabilityScore": score,
        "trajectory": trend,
        "trustGap": int(record.get("trustGap") or 0),
        "confidence": conf,
        "sanoLabel": label(score, trend, conf, recent_critical),
        "explanation": "Derived from inspection score burden, critical flags, repeat patterns, volatility, and trend.",
        "dataAsOf": data_as_of,
        "inspections": inspections,
        "alternatives": record.get("alternatives") or [],
        "sourceNotes": source_note,
    }


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
    provenance = {
        "sourceName": "NYC DOHMH Restaurant Inspection Results",
        "source": "normalized-official-records",
        "inputPath": str(input_path),
        "outputPath": str(output_path),
        "scoredAt": datetime.now(timezone.utc).isoformat(),
        "dataAsOf": data_as_of,
        "inputRestaurantCount": input_count,
        "scoredRestaurantCount": output_count,
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
    app_records = [
        build_app_record(record, args.data_as_of)
        for record in eligible_records[: args.limit]
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
