"""Transcribed from normalize-street/src/normalizeStreet.spec.ts and
normalizeStreet.edge.spec.ts — the assertions must stay in lockstep with the
TypeScript suite, plus JS-parity edge cases at the bottom."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from generate_impi_db import normalize_street, normalize_street_number


class TestNormalizeStreet(unittest.TestCase):
    # normalizeStreet.spec.ts "manual tests"
    CASES = [
        ("Höhenweg", "hoehenw"),
        ("Hööhenweg", "hoeoehenw"),
        ("èéêëàáâôòóûùúïíîç", "eeeeaaaooouuuiiic"),
        ("die Höhe", "hoehe"),
        ("A Gréi", "grei"),
        ("Gréi", "grei"),
        ("A San Martin", "smartin"),
        ("L'A Neuve CAS", "neuvecas"),
        ("A-Ry", "ry"),
        # normalizeStreet.edge.spec.ts
        ("BAHNHOFSTRASSE", "bahnhofstr"),
        ("Strasse 1", "str1"),
        ("   ", ""),
        ("Ärgerüberösig", "aergerueberoesig"),
        ("Hauptstrasse (alt)", "hauptstr"),
        ("Haupt/Nebenstrasse", "haupt"),
    ]

    def test_cases(self):
        for value, expected in self.CASES:
            with self.subTest(value=value):
                self.assertEqual(normalize_street(value), expected)

    def test_throws_on_non_string(self):
        with self.assertRaisesRegex(TypeError, "must be a string"):
            normalize_street(123)

    def test_very_long_input(self):
        result = normalize_street("A" * 500 + "strasse")
        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 0)

    def test_multiple_consecutive_hyphens(self):
        self.assertIsInstance(normalize_street("Test--Strasse"), str)


class TestNormalizeStreetNumber(unittest.TestCase):
    # normalizeStreet.spec.ts "manual streetNumber Tests" + edge cases
    CASES = [
        ("1a /1b", "1a"),
        ("1a / 1b", "1a"),
        ("1a/ 1b", "1a"),
        ("1a/1b", "1a"),
        ("", ""),
        ("abc", "abc"),
        ("1a & 2b", "1a"),
        ("1a + 2b", "1a"),
        ("1a\\2b", "1a"),
    ]

    def test_cases(self):
        for value, expected in self.CASES:
            with self.subTest(value=value):
                self.assertEqual(normalize_street_number(value), expected)

    def test_throws_on_non_string(self):
        with self.assertRaisesRegex(TypeError, "must be a string"):
            normalize_street_number(42)


class TestJsParityGotchas(unittest.TestCase):
    """Behaviors that must match the JS implementation exactly."""

    def test_eszett_is_preserved(self):
        # JS toLowerCase() keeps 'ß' (unlike Python casefold which gives 'ss'),
        # so 'straße' does NOT match the 'strasse' abbreviation rule.
        self.assertEqual(normalize_street("Bahnhofstraße"), "bahnhofstraße")

    def test_leading_truncation_char_is_kept(self):
        # Truncation requires index > 0 — a leading '(' or '/' is untouched.
        self.assertEqual(normalize_street("(alt) Hauptstrasse"), "(alt)hauptstr")
        self.assertEqual(normalize_street_number("/1b"), "/1b")

    def test_chained_prefix_removal(self):
        # Prefix loop restarts after each strip: "l'" then "a ".
        self.assertEqual(normalize_street("l'a test"), "test")

    def test_decomposed_accents_not_stripped(self):
        # The accent map only covers precomposed characters (no NFD handling).
        decomposed = "Gre\u0301i"  # e + combining acute, not precomposed \u00e9
        self.assertEqual(normalize_street(decomposed), "gre\u0301i")


if __name__ == "__main__":
    unittest.main()
