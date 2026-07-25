#!/usr/bin/env python3
"""Validate app-ready Sano restaurant seed JSON.

This script is intentionally stricter than the UI. It is the gate between
"we have JSON" and "this JSON is safe to wire into the app/demo story."
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from typing import Any


PUBLIC_GRADES = {"A", "B", "C", "Pending", "Not Yet Graded"}
TRAJECTORIES = {"improving", "stable", "declining", "volatile"}
CONFIDENCE_LEVELS = {"high", "medium", "limited"}
SANO_LABELS = {
    "Consistent record",
    "Improving record",
    "Volatile history",
    "Recent critical flag",
    "Limited data",
}
PRICE_LEVELS = {"$", "$$", "$$$"}

RESTAURANT_FIELDS = {
    "id",
    "name",
    "cuisine",
    "neighborhood",
    "borough",
    "address",
    "latitude",
    "longitude",
    "rating",
    "reviewCount",
    "priceLevel",
    "grade",
    "inspectionReliabilityScore",
    "trajectory",
    "trustGap",
    "confidence",
    "sanoLabel",
    "explanation",
    "dataAsOf",
    "inspections",
    "alternatives",
    "sourceNotes",
}

INSPECTION_FIELDS = {
    "id",
    "date",
    "score",
    "grade",
    "criticalCount",
    "violationCodes",
    "repeatPattern",
    "note",
}


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def valid_date(value: Any) -> bool:
    if not isinstance(value, str) or not value:
        return False
    try:
        date.fromisoformat(value[:10])
    except ValueError:
        return False
    return True


def parsed_date(value: Any) -> date | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def expected_confidence(inspection_count: int) -> str:
    if inspection_count >= 5:
        return "high"
    if inspection_count >= 3:
        return "medium"
    return "limited"


def detect_kind(records: list[dict[str, Any]]) -> str:
    notes = " ".join(str(record.get("sourceNotes", "")) for record in records).lower()
    if "synthetic demo seed" in notes:
        return "synthetic"
    if "generated from normalized nyc dohmh inspection records" in notes:
        return "official"
    return "unknown"


def validate_record(
    record: dict[str, Any],
    *,
    index: int,
    ids: set[str],
    expected_kind: str,
) -> list[str]:
    errors: list[str] = []
    label = str(record.get("id") or f"index {index}")

    missing = sorted(RESTAURANT_FIELDS - set(record))
    if missing:
        errors.append(f"{label}: missing restaurant fields: {', '.join(missing)}")

    restaurant_id = record.get("id")
    if not isinstance(restaurant_id, str) or not restaurant_id.strip():
        errors.append(f"{label}: id must be a non-empty string")
    elif restaurant_id in ids:
        errors.append(f"{label}: duplicate restaurant id")
    else:
        ids.add(restaurant_id)

    for field in ["name", "cuisine", "neighborhood", "borough", "address", "explanation"]:
        if not isinstance(record.get(field), str) or not record.get(field, "").strip():
            errors.append(f"{label}: {field} must be a non-empty string")

    if not is_number(record.get("latitude")):
        errors.append(f"{label}: latitude must be numeric")
    elif not -90 <= record.get("latitude") <= 90:
        errors.append(f"{label}: latitude must be between -90 and 90")
    if not is_number(record.get("longitude")):
        errors.append(f"{label}: longitude must be numeric")
    elif not -180 <= record.get("longitude") <= 180:
        errors.append(f"{label}: longitude must be between -180 and 180")
    if expected_kind == "official" and record.get("rating") is None:
        pass
    elif not is_number(record.get("rating")) or record.get("rating") < 0:
        errors.append(f"{label}: rating must be null or a non-negative number")
    if expected_kind == "official" and record.get("reviewCount") is None:
        pass
    elif not isinstance(record.get("reviewCount"), int) or record.get("reviewCount") < 0:
        errors.append(f"{label}: reviewCount must be null or a non-negative integer")
    if expected_kind == "official" and record.get("priceLevel") is None:
        pass
    elif record.get("priceLevel") not in PRICE_LEVELS:
        errors.append(f"{label}: priceLevel must be null or one of {sorted(PRICE_LEVELS)}")
    if record.get("grade") not in PUBLIC_GRADES:
        errors.append(f"{label}: grade must be one of {sorted(PUBLIC_GRADES)}")
    if (
        not isinstance(record.get("inspectionReliabilityScore"), int)
        or not 0 <= record.get("inspectionReliabilityScore") <= 100
    ):
        errors.append(f"{label}: inspectionReliabilityScore must be an integer 0-100")
    if record.get("trajectory") not in TRAJECTORIES:
        errors.append(f"{label}: trajectory must be one of {sorted(TRAJECTORIES)}")
    if expected_kind == "official" and record.get("trustGap") is None:
        pass
    elif not isinstance(record.get("trustGap"), int):
        errors.append(f"{label}: trustGap must be null or an integer")
    if record.get("confidence") not in CONFIDENCE_LEVELS:
        errors.append(f"{label}: confidence must be one of {sorted(CONFIDENCE_LEVELS)}")
    if record.get("sanoLabel") not in SANO_LABELS:
        errors.append(f"{label}: sanoLabel must be one of {sorted(SANO_LABELS)}")
    if not valid_date(record.get("dataAsOf")):
        errors.append(f"{label}: dataAsOf must be an ISO date")
    data_as_of = parsed_date(record.get("dataAsOf"))

    inspections = record.get("inspections")
    if not isinstance(inspections, list) or not inspections:
        errors.append(f"{label}: inspections must be a non-empty list")
        inspections = []

    expected = expected_confidence(len(inspections))
    if record.get("confidence") != expected:
        errors.append(
            f"{label}: confidence {record.get('confidence')} does not match "
            f"{len(inspections)} inspections; expected {expected}"
        )

    for inspection_index, inspection in enumerate(inspections):
        inspection_label = f"{label}.inspections[{inspection_index}]"
        if not isinstance(inspection, dict):
            errors.append(f"{inspection_label}: must be an object")
            continue

        missing_inspection_fields = sorted(INSPECTION_FIELDS - set(inspection))
        if missing_inspection_fields:
            errors.append(
                f"{inspection_label}: missing fields: {', '.join(missing_inspection_fields)}"
            )
        if not isinstance(inspection.get("id"), str) or not inspection.get("id", "").strip():
            errors.append(f"{inspection_label}: id must be a non-empty string")
        if not valid_date(inspection.get("date")):
            errors.append(f"{inspection_label}: date must be an ISO date")
        elif data_as_of and parsed_date(inspection.get("date")):
            inspection_date = parsed_date(inspection.get("date"))
            if inspection_date and inspection_date > data_as_of:
                errors.append(f"{inspection_label}: inspection date is after dataAsOf")
        if not isinstance(inspection.get("score"), int) or inspection.get("score") < 0:
            errors.append(f"{inspection_label}: score must be a non-negative integer")
        if inspection.get("grade") not in PUBLIC_GRADES:
            errors.append(f"{inspection_label}: grade must be one of {sorted(PUBLIC_GRADES)}")
        if (
            not isinstance(inspection.get("criticalCount"), int)
            or inspection.get("criticalCount") < 0
        ):
            errors.append(f"{inspection_label}: criticalCount must be a non-negative integer")
        if not isinstance(inspection.get("violationCodes"), list):
            errors.append(f"{inspection_label}: violationCodes must be a list")
        if not isinstance(inspection.get("repeatPattern"), bool):
            errors.append(f"{inspection_label}: repeatPattern must be boolean")
        if not isinstance(inspection.get("note"), str) or not inspection.get("note", "").strip():
            errors.append(f"{inspection_label}: note must be a non-empty string")

    alternatives = record.get("alternatives")
    if not isinstance(alternatives, list):
        errors.append(f"{label}: alternatives must be a list")
    elif not all(isinstance(item, str) for item in alternatives):
        errors.append(f"{label}: alternatives must contain only restaurant ids")

    source_notes = str(record.get("sourceNotes", ""))
    lowered_notes = source_notes.lower()
    if expected_kind == "synthetic":
        if "synthetic demo seed" not in lowered_notes:
            errors.append(f"{label}: synthetic seed must disclose synthetic demo provenance")
        if "not an official record extract" not in lowered_notes:
            errors.append(f"{label}: synthetic seed must say it is not an official extract")
    if expected_kind == "official":
        if "generated from normalized nyc dohmh inspection records" not in lowered_notes:
            errors.append(f"{label}: official seed must disclose generated official provenance")
        if "synthetic demo seed" in lowered_notes:
            errors.append(f"{label}: official seed must not use synthetic seed language")
        if record.get("rating") not in (0, 0.0, None):
            errors.append(f"{label}: official seed rating must be null/0 unless a popularity source is added")
        if record.get("reviewCount") not in (0, None):
            errors.append(
                f"{label}: official seed reviewCount must be null/0 unless a popularity source is added"
            )
        if record.get("trustGap") not in (0, None):
            errors.append(
                f"{label}: official seed trustGap must be null/0 unless a popularity source is added"
            )

    return errors


def validate(path: Path, expected_kind: str) -> list[str]:
    records = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(records, list):
        return [f"{path}: top-level JSON must be a list"]
    if not records:
        return [f"{path}: seed must contain at least one restaurant"]

    actual_kind = detect_kind(records)
    if expected_kind == "auto":
        expected_kind = actual_kind
    if expected_kind not in {"synthetic", "official"}:
        return [
            f"{path}: could not determine seed kind from sourceNotes; pass "
            "--kind synthetic or --kind official"
        ]

    errors: list[str] = []
    ids: set[str] = set()
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            errors.append(f"index {index}: restaurant must be an object")
            continue
        errors.extend(
            validate_record(record, index=index, ids=ids, expected_kind=expected_kind)
        )

    known_ids = ids
    for record in records:
        if not isinstance(record, dict):
            continue
        for alternative in record.get("alternatives", []):
            if isinstance(alternative, str) and alternative not in known_ids:
                errors.append(f"{record.get('id')}: alternative {alternative} does not exist")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path, help="App-ready restaurant seed JSON")
    parser.add_argument(
        "--kind",
        choices=["auto", "synthetic", "official"],
        default="auto",
        help="Expected seed provenance kind",
    )
    args = parser.parse_args()

    errors = validate(args.path, args.kind)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"Validation failed with {len(errors)} error(s).", file=sys.stderr)
        return 1

    records = json.loads(args.path.read_text(encoding="utf-8"))
    print(f"Validated {len(records)} restaurant records in {args.path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
