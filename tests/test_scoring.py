"""Tests for the Sano scoring rules in scripts/score_restaurants.py.

Run with: python3 -m unittest discover -s tests
"""

from __future__ import annotations

import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("score_restaurants", ROOT / "scripts" / "score_restaurants.py")
scoring = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(scoring)


def inspection(date: str, score: int, critical: int = 0, codes: list[str] | None = None) -> dict:
    return {"date": date, "score": score, "criticalCount": critical, "violationCodes": codes or []}


class RepeatPatternTests(unittest.TestCase):
    def test_first_occurrence_of_a_code_is_not_a_repeat(self):
        history = [
            inspection("2025-01-10", 10, codes=["04L"]),
            inspection("2025-06-10", 12, codes=["04L", "10F"]),
        ]
        scoring.repeat_patterns(history)
        self.assertFalse(history[0]["repeatPattern"])
        self.assertTrue(history[1]["repeatPattern"])

    def test_order_of_the_input_list_does_not_matter(self):
        history = [
            inspection("2025-06-10", 12, codes=["04L"]),
            inspection("2025-01-10", 10, codes=["04L"]),
        ]
        scoring.repeat_patterns(history)
        by_date = {item["date"]: item["repeatPattern"] for item in history}
        self.assertEqual(by_date, {"2025-01-10": False, "2025-06-10": True})

    def test_different_codes_are_not_repeats(self):
        history = [inspection("2025-01-10", 10, codes=["04L"]), inspection("2025-06-10", 12, codes=["10F"])]
        scoring.repeat_patterns(history)
        self.assertEqual([item["repeatPattern"] for item in history], [False, False])


class TrajectoryTests(unittest.TestCase):
    def test_fewer_than_three_inspections_is_stable(self):
        self.assertEqual(scoring.trajectory([inspection("2025-01-01", 40), inspection("2025-02-01", 0)]), "stable")

    def test_a_swing_of_12_points_is_volatile(self):
        history = [inspection("2025-01-01", 10), inspection("2025-02-01", 22), inspection("2025-03-01", 20)]
        self.assertEqual(scoring.trajectory(history), "volatile")

    def test_falling_scores_are_improving(self):
        # Lower DOHMH scores are better: fewer points against the restaurant.
        history = [inspection("2025-01-01", 20), inspection("2025-02-01", 15), inspection("2025-03-01", 10)]
        self.assertEqual(scoring.trajectory(history), "improving")

    def test_rising_scores_are_declining(self):
        history = [inspection("2025-01-01", 10), inspection("2025-02-01", 15), inspection("2025-03-01", 20)]
        self.assertEqual(scoring.trajectory(history), "declining")

    def test_small_changes_are_stable(self):
        history = [inspection("2025-01-01", 10), inspection("2025-02-01", 12), inspection("2025-03-01", 11)]
        self.assertEqual(scoring.trajectory(history), "stable")


class ReliabilityScoreTests(unittest.TestCase):
    def test_worked_example_from_the_methodology_page(self):
        # Lucky Chix in the official extract: scores 41, 2, 0, 2; two critical
        # flags on the oldest inspection; no repeats; volatile (41 -> 2).
        # 100 - 11.25 * 1.7 - 2 * 0.6 - 2 * 4 - 0 - 12 = 59.675 -> 60
        history = [
            inspection("2026-02-19", 41, critical=2, codes=["06C", "05F", "10G"]),
            inspection("2026-03-10", 2, codes=["10D"]),
            inspection("2026-03-16", 0),
            inspection("2026-05-27", 2, codes=["10F"]),
        ]
        scoring.repeat_patterns(history)
        self.assertEqual(scoring.reliability_score(history), 60)

    def test_clean_history_scores_100(self):
        history = [inspection("2025-01-01", 0), inspection("2025-02-01", 0), inspection("2025-03-01", 0)]
        scoring.repeat_patterns(history)
        self.assertEqual(scoring.reliability_score(history), 100)

    def test_score_is_clamped_to_zero(self):
        history = [inspection("2025-01-01", 60, critical=5), inspection("2025-02-01", 70, critical=5)]
        scoring.repeat_patterns(history)
        self.assertEqual(scoring.reliability_score(history), 0)

    def test_no_inspections_scores_zero(self):
        self.assertEqual(scoring.reliability_score([]), 0)


class ConfidenceAndLabelTests(unittest.TestCase):
    def test_confidence_thresholds(self):
        self.assertEqual(scoring.confidence([{}] * 2), "limited")
        self.assertEqual(scoring.confidence([{}] * 3), "medium")
        self.assertEqual(scoring.confidence([{}] * 5), "high")

    def test_a_recent_critical_flag_outranks_limited_data(self):
        self.assertEqual(scoring.label(90, "stable", "limited", True), "Recent critical flag")

    def test_label_precedence(self):
        self.assertEqual(scoring.label(90, "stable", "limited", False), "Limited data")
        self.assertEqual(scoring.label(90, "volatile", "high", False), "Volatile history")
        self.assertEqual(scoring.label(61, "stable", "high", False), "Volatile history")
        self.assertEqual(scoring.label(62, "improving", "high", False), "Improving record")
        self.assertEqual(scoring.label(62, "stable", "high", False), "Consistent record")

    def test_recent_critical_looks_at_the_two_latest_inspections_only(self):
        history = [
            inspection("2025-01-01", 30, critical=3),
            inspection("2025-02-01", 0),
            inspection("2025-03-01", 0),
        ]
        self.assertFalse(scoring.has_recent_critical(history))
        history[1]["criticalCount"] = 1
        self.assertTrue(scoring.has_recent_critical(history))


class SeedIntegrityTests(unittest.TestCase):
    """The committed seed must be exactly what the scorer produces from its own
    inspection history, so the UI never shows a number the methodology can't
    reproduce."""

    def test_official_seed_matches_the_scorer(self):
        seed = json.loads((ROOT / "data" / "official-restaurants.json").read_text(encoding="utf-8"))
        self.assertGreater(len(seed), 0)
        for record in seed:
            with self.subTest(restaurant=record["name"]):
                expected = scoring.rescore_record(copy.deepcopy(record))
                for field in ("inspectionReliabilityScore", "trajectory", "confidence", "sanoLabel"):
                    self.assertEqual(record[field], expected[field], field)
                stored = [item["repeatPattern"] for item in record["inspections"]]
                recomputed = [item["repeatPattern"] for item in expected["inspections"]]
                self.assertEqual(stored, recomputed, "repeatPattern")


if __name__ == "__main__":
    unittest.main()
