"""Transcribed from normalize-city/src/normalizeCity.spec.ts and
normalizeCity.edge.spec.ts, plus JS-parity edge cases."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from generate_impi_db import normalize_city


class TestNormalizeCity(unittest.TestCase):
    # normalizeCity.spec.ts "manual tests"
    CASES = [
        ("Val-de-Ruz", "valruz"),
        ("Ilanz/Glion", "ilanzglion"),
        ("St. Gallen", "stgallen"),
        ("Romont", "romont"),
        ("Le Bémont", "bemont"),
        ("Castel San Pietro", "castel"),
        ("Riva San Vitale", "riva"),
        # normalizeCity.edge.spec.ts
        ("ZÜRICH", "zuerich"),
        ("   ", ""),
        ("Basel 2", "basel2"),
        ("Bern (BE)", "bern"),
        ("Val de la Roche", "valroche"),
        ("Vevey sur Montreux", "vevey"),
        ("Münsingen-Überstorf", "muensingenueberstorf"),
    ]

    def test_cases(self):
        for value, expected in self.CASES:
            with self.subTest(value=value):
                self.assertEqual(normalize_city(value), expected)

    def test_throws_on_non_string(self):
        with self.assertRaisesRegex(TypeError, "must be a string"):
            normalize_city(123)

    def test_very_long_input(self):
        result = normalize_city("A" * 500)
        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 0)


class TestJsParityGotchas(unittest.TestCase):
    """Behaviors that must match the JS implementation exactly."""

    def test_paren_truncation_off_by_one(self):
        # City truncates at parenIndex - 1 (street uses parenIndex). With no
        # space before the paren, the preceding character is dropped too.
        self.assertEqual(normalize_city("Bern(BE)"), "ber")

    def test_leading_paren_is_kept(self):
        # index > 0 strictly — a leading '(' does not truncate.
        self.assertEqual(normalize_city("(Bern"), "(bern")

    def test_eszett_is_preserved(self):
        self.assertEqual(normalize_city("Groß"), "groß")

    def test_truncation_token_at_start_is_kept(self):
        # ' sur ' at index 0 must not truncate (index > 0 check).
        self.assertEqual(normalize_city(" sur Montreux"), "surmontreux")


if __name__ == "__main__":
    unittest.main()
