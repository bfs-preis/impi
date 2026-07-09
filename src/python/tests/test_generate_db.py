"""End-to-end test: build a mini geo DB from small fixture CSVs and assert
schema, row counts, normalization, SQLite type affinity, error handling and
config-merge semantics."""

import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from generate_impi_db import (
    build_arg_parser,
    build_config,
    check_doubles,
    check_k_factor,
    generate,
)

# Deliberately shuffled column order + an extra column; headers case-insensitive.
BUILDINGS_CSV = """Street;EGID;StreetNumber;ZipCode;Community;DesignationOfBuilding;Canton;MajorStatisticalRegion;CommunityType;SecondAppartementQuota;TaxBurden;TravelTimeToCenters;PublicTransportQuality;NoiseExposure;Slope;Exposure;LakeView;MountainView;DistanceToLakes;DistanceToRivers;DistanceToHighvoltagePowerlines;YearOfConstruction;ExtraColumn
Wannerstrasse;1001;33;8045;Zürich;;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;2000;x
Höhenweg;1002;4b /1c;3000;Bern;Grand Chalet;2;2;1;1;1;1;1;1;1;1;1;1;1;1;1;;x
Wannerstrasse;1003;33;8045;Zürich;;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1917;x
"""

CENTER_STREET_CSV = """ZipCode;Community;Street;EGID
8045;Zürich;Wannerstrasse;1001
3000;Bern;Höhenweg;1002
"""

CENTER_PLZ_CSV = """ZipCode;Community;EGID
8045;Zürich;1001
3000;Bern;1002
"""

ADDITIONAL_CSV = """Original;Alternativ
8045;8046
"""

YEARGROUPS_CSV = """MaxYear;Code
1918;1
2015;2
"""


class GenerateDbTestCase(unittest.TestCase):

    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.base = Path(self.dir.name)
        self.db_path = str(self.base / "test.db")

    def tearDown(self):
        self.dir.cleanup()

    def write_csv(self, name, content, encoding="cp1252"):
        path = self.base / name
        path.write_text(content, encoding=encoding)
        return str(path)

    def run_generate(self, yeargroups=None, buildings=BUILDINGS_CSV):
        return generate(
            self.db_path, "1.0.0", "01.01.2025", "31.12.2025",
            self.write_csv("street.csv", CENTER_STREET_CSV),
            self.write_csv("plz.csv", CENTER_PLZ_CSV),
            self.write_csv("buildings.csv", buildings),
            self.write_csv("additional.csv", ADDITIONAL_CSV),
            yeargroups,
            "windows1252",
        )

    def test_full_generation(self):
        counts = self.run_generate()
        self.assertEqual(counts, {
            "CENTERSTREETS": 2,
            "CENTERCOMMUNITIES": 2,
            "BUILDINGS": 3,
            "ADDITIONALCOMMUNITIES": 1,
            "YEAR_GROUPS": 0,
        })

        conn = sqlite3.connect(self.db_path)
        try:
            # Schema: tables, indexes and DDL match the Node tool's format.
            master = dict(conn.execute(
                "SELECT name, sql FROM sqlite_master WHERE sql IS NOT NULL"))
            self.assertEqual(
                set(master),
                {"VERSION", "CENTERSTREETS", "CENTERCOMMUNITIES", "BUILDINGS",
                 "ADDITIONALCOMMUNITIES", "YEAR_GROUPS", "I_CENTERSTREETS",
                 "I_CENTERCOMMUNITIES", "I_BUILDINGS", "I_BUILDINGS_EGID",
                 "I_ADDITIONALCOMMUNITIES"},
            )
            self.assertEqual(
                master["VERSION"],
                "CREATE TABLE VERSION (version TEXT,period_from TEXT,period_to TEXT)")
            self.assertEqual(
                master["I_BUILDINGS"],
                "CREATE INDEX I_BUILDINGS ON BUILDINGS (street,street_number,zip_code,community)")

            self.assertEqual(
                conn.execute("SELECT * FROM VERSION").fetchall(),
                [("1.0.0", "01.01.2025", "31.12.2025")])

            # Normalization applied to street/community/streetnumber/designation.
            rows = conn.execute(
                "SELECT street, street_number, community, designation_of_building "
                "FROM BUILDINGS ORDER BY egid").fetchall()
            self.assertEqual(rows[0], ("wannerstr", "33", "zuerich", ""))
            self.assertEqual(rows[1], ("hoehenw", "4b", "bern", "grchalet"))

            # Affinity: numeric strings stored as INTEGER, '' stays TEXT.
            self.assertEqual(
                conn.execute(
                    "SELECT typeof(year_of_construction) FROM BUILDINGS ORDER BY egid"
                ).fetchall(),
                [("integer",), ("text",), ("integer",)])
            self.assertEqual(
                conn.execute("SELECT typeof(zip_code) FROM CENTERSTREETS LIMIT 1").fetchone(),
                ("integer",))
        finally:
            conn.close()

    def test_check_doubles_counts_duplicate_groups(self):
        self.run_generate()
        counts = check_doubles(self.db_path)
        # Rows 1 and 3 share street/number/zip/community -> one group of 2.
        self.assertEqual(counts, {"Buildings": 2, "CenterStreets": 0, "CenterCommunities": 0})

    def test_k_factor_fails_on_small_categories(self):
        self.run_generate()
        # Every category has < 3 buildings in the fixture.
        self.assertFalse(check_k_factor(self.db_path))

    def test_yeargroups_table_loaded(self):
        counts = self.run_generate(yeargroups=self.write_csv("yg.csv", YEARGROUPS_CSV))
        self.assertEqual(counts["YEAR_GROUPS"], 2)
        conn = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(
                conn.execute("SELECT max_year, code FROM YEAR_GROUPS ORDER BY max_year").fetchall(),
                [(1918, 1), (2015, 2)])
        finally:
            conn.close()

    def test_missing_column_aborts(self):
        bad = BUILDINGS_CSV.replace("EGID;", "NotEgid;")
        with self.assertRaisesRegex(ValueError, r'Not all Columns:\["egid"\]'):
            self.run_generate(buildings=bad)

    def test_ragged_row_aborts(self):
        bad = BUILDINGS_CSV + "too;short\n"
        with self.assertRaisesRegex(ValueError, "Invalid record length"):
            self.run_generate(buildings=bad)

    def test_cp1252_decoding(self):
        # 'Zürich' written in cp1252 must round-trip to 'zuerich'.
        self.run_generate()
        conn = sqlite3.connect(self.db_path)
        try:
            communities = {row[0] for row in conn.execute("SELECT community FROM BUILDINGS")}
            self.assertIn("zuerich", communities)
        finally:
            conn.close()


class ConfigMergeTestCase(unittest.TestCase):

    def parse(self, argv):
        return build_config(build_arg_parser().parse_args(argv))

    def test_cli_only(self):
        config = self.parse(["-g", "out.db", "-q", "1.0", "-f", "01.01.2025",
                             "-t", "31.12.2025", "-s", "s.csv", "-c", "c.csv",
                             "-b", "b.csv", "-a", "a.csv"])
        self.assertEqual(config["output"], "out.db")
        self.assertEqual(config["csv"]["encoding"], "windows1252")
        self.assertIsNone(config["csv"]["yeargroups"])

    def test_blank_paths_become_none(self):
        config = self.parse(["-s", "  ", "-g", "out.db"])
        self.assertIsNone(config["csv"]["street"])

    def test_config_file_wins_when_truthy(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as handle:
            json.dump({"csv": {"street": "file.csv", "encoding": "utf8"},
                       "db": {"version": "9.9.9"},
                       "output": "file.db"}, handle)
            config_path = handle.name
        config = self.parse(["-s", "cli.csv", "-g", "cli.db", "-q", "1.0",
                             "-C", config_path])
        self.assertEqual(config["csv"]["street"], "file.csv")   # file overrides CLI
        self.assertEqual(config["csv"]["encoding"], "utf8")
        self.assertEqual(config["db"]["version"], "9.9.9")
        self.assertEqual(config["output"], "file.db")

    def test_cli_survives_when_config_value_missing(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as handle:
            json.dump({"db": {"from": "01.01.2020"}}, handle)
            config_path = handle.name
        config = self.parse(["-s", "cli.csv", "-g", "cli.db", "-C", config_path])
        self.assertEqual(config["csv"]["street"], "cli.csv")
        self.assertEqual(config["output"], "cli.db")
        self.assertEqual(config["db"]["from"], "01.01.2020")


if __name__ == "__main__":
    unittest.main()
