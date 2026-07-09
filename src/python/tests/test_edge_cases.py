"""Edge cases: WHATWG windows-1252 decoding fallback and the batch-replay
skip path for failing inserts."""

import logging
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from generate_impi_db import _insert_batch, generate, resolve_encoding


class C1FallbackTestCase(unittest.TestCase):
    """cp1252 leaves 0x81/0x8D/0x8F/0x90/0x9D undefined; iconv-lite (the Node
    tool) maps them to the C1 controls per the WHATWG spec. The custom
    'impi_c1' error handler must reproduce that, not U+FFFD."""

    def test_undefined_cp1252_bytes_map_to_c1_controls(self):
        codec, errors = resolve_encoding("windows1252")
        for byte in (0x81, 0x8D, 0x8F, 0x90, 0x9D):
            with self.subTest(byte=hex(byte)):
                decoded = bytes([byte]).decode(codec, errors)
                self.assertEqual(decoded, chr(byte))

    def test_defined_cp1252_bytes_unaffected(self):
        codec, errors = resolve_encoding("windows1252")
        self.assertEqual(b"Z\xfcrich".decode(codec, errors), "Zürich")
        self.assertEqual(b"\x80".decode(codec, errors), "€")  # euro sign

    def test_generate_survives_undefined_byte(self):
        # A 0x81 byte inside a community name must not abort the import.
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            (base / "street.csv").write_bytes(
                b"ZipCode;Community;Street;EGID\n8045;Z\x81rich;Wannerstrasse;1\n")
            (base / "plz.csv").write_bytes(b"ZipCode;Community;EGID\n8045;Bern;1\n")
            (base / "b.csv").write_bytes(
                b"EGID;Street;StreetNumber;ZipCode;Community;DesignationOfBuilding;"
                b"Canton;MajorStatisticalRegion;CommunityType;SecondAppartementQuota;"
                b"TaxBurden;TravelTimeToCenters;PublicTransportQuality;NoiseExposure;"
                b"Slope;Exposure;LakeView;MountainView;DistanceToLakes;DistanceToRivers;"
                b"DistanceToHighvoltagePowerlines;YearOfConstruction\n"
                b"1;Teststrasse;1;8045;Bern;;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;2000\n")
            (base / "a.csv").write_bytes(b"Original;Alternativ\n8045;8046\n")
            db_path = str(base / "test.db")

            counts = generate(db_path, "1.0", "01.01.2025", "31.12.2025",
                              str(base / "street.csv"), str(base / "plz.csv"),
                              str(base / "b.csv"), str(base / "a.csv"),
                              None, "windows1252")
            self.assertEqual(counts["CENTERSTREETS"], 1)

            conn = sqlite3.connect(db_path)
            try:
                community = conn.execute("SELECT community FROM CENTERSTREETS").fetchone()[0]
                # normalize_city lowercases; the C1 control survives untouched
                self.assertEqual(community, "z\x81rich")
            finally:
                conn.close()


class InsertBatchReplayTestCase(unittest.TestCase):
    """A failing executemany batch is replayed row-by-row: bad rows are
    warn-logged and skipped, good rows in the same batch still count."""

    def setUp(self):
        # isolation_level=None mirrors the production connection setup
        self.conn = sqlite3.connect(":memory:", isolation_level=None)
        self.conn.execute("CREATE TABLE t (a INTEGER, b TEXT)")

    def tearDown(self):
        self.conn.close()

    def test_all_good_rows(self):
        inserted = _insert_batch(self.conn, "INSERT INTO t VALUES (?,?)",
                                 [["1", "x"], ["2", "y"]])
        self.assertEqual(inserted, 2)

    def test_bad_row_is_skipped_and_logged(self):
        batch = [["1", "x"], ["2", "y", "EXTRA"], ["3", "z"]]  # wrong arity
        with self.assertLogs("generate_impi_db", level=logging.WARNING) as logs:
            inserted = _insert_batch(self.conn, "INSERT INTO t VALUES (?,?)", batch)
        self.assertEqual(inserted, 2)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM t").fetchone()[0], 2)
        self.assertIn("EXTRA", "".join(logs.output))


if __name__ == "__main__":
    unittest.main()
