#!/usr/bin/env python3
"""Generate the IMPI SQLite geo database from CSV input files.

Python 3.11 port of the Node.js `generate-impi-db` CLI
(src/libs/generate-impi-geo-database). Standard library only — runs on a bare
Python 3.11 without pip. Produces a database that is logically identical to
the Node tool's output: same schema, same normalized values, same row counts.

Usage:
    python3 generate_impi_db.py -g geo.db -q 1.0.0 -f 01.01.2025 -t 31.12.2025 \
        -s CENTER_STREET.csv -c CENTER_PLZ.csv -b BUILDINGS.csv \
        -a ALTERNATIVE_ZIPCODES.csv [-y YEARGROUPS.csv] [-e windows1252]

The normalization sections below are line-by-line ports of
normalize-common/normalize-street/normalize-city. Rule order, the strict
`index > 0` truncation checks and the city/street parenthesis off-by-one all
define the matching keys used by impilib — do not "clean them up".
"""

import argparse
import codecs
import csv
import json
import logging
import os
import sqlite3
import sys
import time
from functools import lru_cache

VERSION = "2.0.0-rc.2"

# ---------------------------------------------------------------------------
# String utilities (port of normalize-common/src/string-utils.ts)
# ---------------------------------------------------------------------------

# JS toLowerCase() and Python str.lower() agree on the character set used
# here; str.casefold() would map 'ß' -> 'ss' which JS does not do.

# JS translate() replaces chars sequentially; the maps below have disjoint
# from/to sets, so a simultaneous str.translate is equivalent.
ACCENT_TRANS = str.maketrans("èéêëàáâôòóûùúïíîç", "eeeeaaaooouuuiiic")
STREET_PUNCT_TRANS = str.maketrans(".,;:-", "     ")
CITY_PUNCT_TRANS = str.maketrans(".,;:-/+&", "        ")


def _validate_string(value, field_name):
    if not isinstance(value, str):
        raise TypeError(f"{field_name} must be a string, received: {type(value).__name__}")
    return value


def _apply_replacements(value, rules):
    # Rules apply sequentially in list order; earlier replacements feed later ones.
    for search, replacement in rules:
        value = value.replace(search, replacement)
    return value


def _apply_truncations(value, tokens):
    # Truncate only when the token appears after position 0 (strictly > 0).
    for token in tokens:
        index = value.find(token)
        if index > 0:
            value = value[:index]
    return value


def _strip_prefixes(value, prefixes):
    # Repeatedly strip the first matching leading prefix; restart the list
    # after each removal so chains like "l'a " resolve ("l'" then "a ").
    removed = True
    while removed:
        removed = False
        for prefix in prefixes:
            if value.startswith(prefix):
                value = value[len(prefix):]
                removed = True
                break
    return value


# ---------------------------------------------------------------------------
# Shared rule tables (port of normalize-common/src/shared-rules.ts)
# ---------------------------------------------------------------------------

SEPARATOR_RULES = [
    (" de l'", " "),
    (" de la ", " "),
    (" da la ", " "),
    (" de ", " "),
    (" des ", " "),
    (" du ", " "),
    (" da ", " "),
    (" al ", " "),
    (" ai ", " "),
    (" d'", " "),
    (" della ", " "),
    (" alla ", " "),
    (" di ", " "),
    (" delle ", " "),
    (" del'", " "),
    (" del ", " "),
    (" dei ", " "),
    (" dell'", " "),
]

PREPOSITION_ABBREVIATION_RULES = [
    ("petite ", "pt "),
    ("petit ", "pt "),
    ("grande ", "gr "),
    ("grand ", "gr "),
    ("santa ", "s "),
    ("sankt ", "st "),
    ("saint ", "s "),
    ("sainte ", "ste "),
    ("ancien ", "anc "),
    ("ancienne ", "anc "),
    ("alte ", "alt "),
    ("alter ", "alt "),
    ("altes ", "alt "),
    ("alten ", "alt "),
]

COMMON_PREFIX_REMOVAL = [
    "beim ",  # 5 chars — must come before 'bei '
    "les ",   # 4 chars
    "auf ",
    "aux ",
    "bei ",
    "der ",
    "die ",
    "das ",
    "zum ",
    "le ",    # 3 chars
    "la ",
    "en ",
    "da ",
    "im ",
    "in ",
    "ai ",
    "al ",
    "am ",
    "l'",     # 2 chars
    "a ",
]

QUOTE_REMOVAL_RULES = [
    ("'", " "),
    ('"', " "),
]

# ---------------------------------------------------------------------------
# Street rules (port of normalize-street/src/normalizeStreet.ts)
# ---------------------------------------------------------------------------

STREET_TYPE_RULES = [
    ("strasse", "str"),
    ("platz", "pl"),
    ("weg", "w"),
    ("avenue ", "av "),
    ("ave.", "av "),
    ("boulevard ", "bd "),
    ("bvd.", "bd "),
    ("chemin ", "ch "),
    ("impasse ", "imp "),
    ("place ", "pl "),
    ("route ", "rte "),
    ("rue ", "r "),
    ("ruelle ", "rlle "),
    ("piazza ", "p "),
    ("viazza ", "v "),
    ("via ", "v "),
    ("viale ", "vl "),
    ("viccolo ", "vic "),
]

GERMAN_ADJECTIVE_RULES = [
    ("hinterer ", "hint "),
    ("hinteren ", "hint "),
    ("hinteres ", "hint "),
    ("hintere ", "hint "),
    ("hinter ", "hint "),
    ("oberen ", "ob "),
    ("oberer ", "ob "),
    ("oberes ", "ob "),
    ("obere ", "ob "),
    ("ober ", "ob "),
    ("vorderen ", "vord "),
    ("vorderer ", "vord "),
    ("vorderes ", "vord "),
    ("vordere ", "vord "),
    ("vorder ", "vord "),
    ("unteren ", "unt "),
    ("unterer ", "unt "),
    ("unteres ", "unt "),
    ("untere ", "unt "),
    ("unter ", "unt "),
    ("mittleren ", "mittl "),
    ("mittlerer ", "mittl "),
    ("mittleres ", "mittl "),
    ("mittlere ", "mittl "),
    ("mittler ", "mittl "),
    ("aeusseren ", "aeuss "),
    ("aeusserer ", "aeuss "),
    ("aeusseres ", "aeuss "),
    ("aeussere ", "aeuss "),
    ("aeusser ", "aeuss "),
    ("inneren ", "inn "),
    ("innerer ", "inn "),
    ("inneres ", "inn "),
    ("innere ", "inn "),
    ("inner ", "inn "),
    ("kleines ", "kl "),
    ("kleiner ", "kl "),
    ("kleinen ", "kl "),
    ("kleine ", "kl "),
    ("klein ", "kl "),
    ("grosses ", "gr "),
    ("grosser ", "gr "),
    ("grossen ", "gr "),
    ("grosse ", "gr "),
    ("gross ", "gr "),
    ("san ", "s "),
    ("mont ", "mt "),
]

STREET_SEPARATOR_EXTRA = [
    (" bei ", " b "),
    (" l'", " "),
    (" le ", " "),
    (" la ", " "),
    (" les ", " "),
]

STREET_PREFIX_REMOVAL = ["au "] + COMMON_PREFIX_REMOVAL

# ---------------------------------------------------------------------------
# City rules (port of normalize-city/src/normalizeCity.ts)
# ---------------------------------------------------------------------------

CITY_TRUNCATION_RULES = [
    " sur ", " sous ", " pres ", " en ", " devant ", " sopra ",
    " in ", " im ", " bei ", " am ", " an ",
    " l' ", " le ", " la ", " les ",
    " b ", " a ", " i ", " s ", " san ", " p ", " pr ", " e ", " l ",
]


# ---------------------------------------------------------------------------
# Normalizers
# ---------------------------------------------------------------------------

@lru_cache(maxsize=None)
def normalize_street(street):
    result = _validate_string(street, "street").lower()

    result = result.translate(ACCENT_TRANS)
    result = result.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")

    result = _apply_replacements(result, STREET_TYPE_RULES)
    result = result.translate(STREET_PUNCT_TRANS)
    result = _apply_replacements(result, SEPARATOR_RULES)
    result = _apply_replacements(result, STREET_SEPARATOR_EXTRA)
    result = _apply_replacements(result, GERMAN_ADJECTIVE_RULES)
    result = _apply_replacements(result, PREPOSITION_ABBREVIATION_RULES)
    result = _strip_prefixes(result, STREET_PREFIX_REMOVAL)
    result = _apply_replacements(result, QUOTE_REMOVAL_RULES)

    paren_index = result.find("(")
    if paren_index > 0:
        result = result[:paren_index]

    slash_index = result.find("/")
    if slash_index > 0:
        result = result[:slash_index]

    return result.strip().replace(" ", "")


@lru_cache(maxsize=None)
def normalize_street_number(street_number):
    result = _validate_string(street_number, "street number").lower()

    result = result.translate(ACCENT_TRANS)
    result = result.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
    result = _apply_replacements(result, QUOTE_REMOVAL_RULES)

    for char in ("(", "&", "+", "/", "\\"):
        index = result.find(char)
        if index > 0:
            result = result[:index]

    return result.replace(" ", "")


@lru_cache(maxsize=None)
def normalize_city(city):
    result = _validate_string(city, "city").lower()

    result = result.translate(ACCENT_TRANS)
    result = result.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")

    result = result.translate(CITY_PUNCT_TRANS)
    result = _apply_replacements(result, SEPARATOR_RULES)
    result = _apply_truncations(result, CITY_TRUNCATION_RULES)
    result = _apply_replacements(result, PREPOSITION_ABBREVIATION_RULES)
    result = _strip_prefixes(result, COMMON_PREFIX_REMOVAL)
    result = _apply_replacements(result, QUOTE_REMOVAL_RULES)

    # City truncates one char earlier than street here — intentional.
    paren_index = result.find("(")
    if paren_index > 0:
        result = result[:paren_index - 1]

    return result.strip().replace(" ", "")


# ---------------------------------------------------------------------------
# Table definitions (port of table-definitions.ts)
# ---------------------------------------------------------------------------

VERSION_TABLE = {
    "name": "VERSION",
    "fields": [("version", "TEXT"), ("period_from", "TEXT"), ("period_to", "TEXT")],
    "indexes": [],
}

CENTERSTREETS_TABLE = {
    "name": "CENTERSTREETS",
    "fields": [
        ("zip_code", "INTEGER"),
        ("community", "TEXT"),
        ("street", "TEXT"),
        ("egid", "INTEGER"),
    ],
    "indexes": [("I_CENTERSTREETS", ["street", "zip_code", "community"])],
}

CENTERCOMMUNITIES_TABLE = {
    "name": "CENTERCOMMUNITIES",
    "fields": [
        ("zip_code", "INTEGER"),
        ("community", "TEXT"),
        ("egid", "INTEGER"),
    ],
    "indexes": [("I_CENTERCOMMUNITIES", ["zip_code", "community"])],
}

ADDITIONALCOMMUNITIES_TABLE = {
    "name": "ADDITIONALCOMMUNITIES",
    "fields": [("original", "INTEGER"), ("alternativ", "INTEGER")],
    "indexes": [("I_ADDITIONALCOMMUNITIES", ["original", "alternativ"])],
}

BUILDINGS_TABLE = {
    "name": "BUILDINGS",
    "fields": [
        ("egid", "INTEGER"),
        ("street", "TEXT"),
        ("street_number", "TEXT"),
        ("zip_code", "INTEGER"),
        ("community", "TEXT"),
        ("designation_of_building", "TEXT"),
        ("canton", "INTEGER"),
        ("major_statistical_region", "INTEGER"),
        ("community_type", "INTEGER"),
        ("second_appartement_quota", "INTEGER"),
        ("tax_burden", "INTEGER"),
        ("travel_time_to_centers", "INTEGER"),
        ("public_transport_quality", "INTEGER"),
        ("noise_exposure", "INTEGER"),
        ("slope", "INTEGER"),
        ("exposure", "INTEGER"),
        ("lake_view", "INTEGER"),
        ("mountain_view", "INTEGER"),
        ("distance_to_lakes", "INTEGER"),
        ("distance_to_rivers", "INTEGER"),
        ("distance_to_highvoltage_powerlines", "INTEGER"),
        ("year_of_construction", "INTEGER"),
    ],
    "indexes": [
        ("I_BUILDINGS", ["street", "street_number", "zip_code", "community"]),
        ("I_BUILDINGS_EGID", ["egid"]),
    ],
}

YEAR_GROUPS_TABLE = {
    "name": "YEAR_GROUPS",
    "fields": [("max_year", "INTEGER"), ("code", "INTEGER")],
    "indexes": [],
}

# Column normalization: CSV record key -> normalizer + target DB column.
NORMALIZED_COLUMNS = [
    ("street", "street", normalize_street),
    ("designationofbuilding", "designation_of_building", normalize_street),
    ("community", "community", normalize_city),
    ("streetnumber", "street_number", normalize_street_number),
]

BATCH_SIZE = 50_000

log = logging.getLogger("generate_impi_db")


# ---------------------------------------------------------------------------
# Encoding — reproduce iconv-lite's WHATWG windows-1252 behavior
# ---------------------------------------------------------------------------

def _c1_control_fallback(error):
    """cp1252 bytes 0x81/0x8D/0x8F/0x90/0x9D are undefined for Python but map
    to C1 controls in WHATWG windows-1252 (what iconv-lite implements)."""
    chunk = error.object[error.start:error.end]
    return "".join(chr(b) for b in chunk), error.end


codecs.register_error("impi_c1", _c1_control_fallback)

ENCODINGS = {
    "windows1252": ("cp1252", "impi_c1"),
    "utf8": ("utf-8", "replace"),
    "iso88591": ("iso-8859-1", "strict"),
    "macintosh": ("mac_roman", "strict"),
}


def resolve_encoding(name):
    key = name.lower().replace("-", "").replace("_", "")
    if key not in ENCODINGS:
        raise ValueError(f"Unsupported encoding: {name} (expected one of {', '.join(ENCODINGS)})")
    return ENCODINGS[key]


# ---------------------------------------------------------------------------
# DB generation (port of generate-impi-db.ts)
# ---------------------------------------------------------------------------

def create_table_and_insert(conn, table, csv_path, encoding, progress=None):
    """Create the table (and later its indexes) and bulk-insert the CSV rows.

    Returns the number of successfully inserted rows. Values are bound as raw
    strings so SQLite column affinity decides storage — INTEGER columns keep
    non-numeric values like '' as TEXT, which the K-Factor SQL relies on.
    """
    name = table["name"]
    fields = table["fields"]

    conn.execute("DROP TABLE IF EXISTS " + name)
    # DDL built exactly like the Node tool so sqlite_master.sql compares equal.
    conn.execute(
        "CREATE TABLE " + name + " (" + ",".join(f"{n} {t}" for n, t in fields) + ")"
    )
    for index_name, _ in table["indexes"]:
        conn.execute("DROP INDEX IF EXISTS " + index_name)

    row_count = 0
    if csv_path:
        row_count = _load_csv(conn, table, csv_path, encoding, progress)

    # Indexes are built after the load (Node creates them before); the final
    # database is logically identical and the bulk build is much faster.
    for index_name, index_fields in table["indexes"]:
        conn.execute(
            "CREATE INDEX " + index_name + " ON " + name + " (" + ",".join(index_fields) + ")"
        )

    return row_count


def _load_csv(conn, table, csv_path, encoding, progress):
    name = table["name"]
    fields = table["fields"]
    field_keys = [field_name.replace("_", "") for field_name, _ in fields]
    insert_sql = "INSERT INTO " + name + " VALUES (" + ",".join("?" * len(fields)) + ")"

    codec, errors = resolve_encoding(encoding)
    row_count = 0

    with open(csv_path, encoding=codec, errors=errors, newline="") as handle:
        reader = csv.reader(handle, delimiter=";")

        header = next(reader, None)
        if header is None:
            return 0
        header_lower = [column.lower() for column in header]

        missing = [key for key in field_keys if key not in header_lower]
        if missing:
            log.debug("Table definition: %s", table)
            raise ValueError("Not all Columns:" + json.dumps(missing))

        source_indexes = [header_lower.index(key) for key in field_keys]
        normalizers = [
            (header_lower.index(csv_key), field_keys.index(column.replace("_", "")), fn)
            for csv_key, column, fn in NORMALIZED_COLUMNS
            if csv_key in header_lower and column.replace("_", "") in field_keys
        ]

        conn.execute("BEGIN")
        try:
            batch = []
            for row in reader:
                if not row:
                    continue
                if len(row) != len(header_lower):
                    raise ValueError(
                        f"Invalid record length: expected {len(header_lower)} columns, "
                        f"got {len(row)} (row {reader.line_num} of {os.path.basename(csv_path)})"
                    )

                values = [row[i] for i in source_indexes]
                for source_index, target_index, normalizer in normalizers:
                    raw = row[source_index]
                    if raw:
                        values[target_index] = normalizer(raw)

                batch.append(values)
                if len(batch) >= BATCH_SIZE:
                    row_count += _insert_batch(conn, insert_sql, batch)
                    batch.clear()
                    if progress:
                        progress(name, row_count)

            if batch:
                row_count += _insert_batch(conn, insert_sql, batch)
                if progress:
                    progress(name, row_count)

            conn.execute("COMMIT")
        except BaseException:
            conn.execute("ROLLBACK")
            raise

    return row_count


def _insert_batch(conn, insert_sql, batch):
    """Insert a batch; on failure replay row-by-row, logging and skipping bad
    rows like the Node tool (skipped rows are not counted). The savepoint
    discards the partial executemany so the replay cannot duplicate rows."""
    conn.execute("SAVEPOINT batch_insert")
    try:
        conn.executemany(insert_sql, batch)
        conn.execute("RELEASE batch_insert")
        return len(batch)
    except sqlite3.Error:
        conn.execute("ROLLBACK TO batch_insert")
        conn.execute("RELEASE batch_insert")
        inserted = 0
        for values in batch:
            try:
                conn.execute(insert_sql, values)
                inserted += 1
            except sqlite3.Error as row_error:
                log.warning("%s %s", row_error, json.dumps(values, ensure_ascii=False))
        return inserted


def generate(output, version, period_from, period_to, csv_street, csv_communities,
             csv_buildings, csv_additional, csv_yeargroups, encoding,
             progress=None, phase_done=None):
    """Create all tables in the Node tool's order. Returns per-table row counts."""
    counts = {}
    conn = sqlite3.connect(output, isolation_level=None)
    try:
        conn.execute("PRAGMA synchronous=OFF")

        create_table_and_insert(conn, VERSION_TABLE, None, encoding)
        conn.execute("INSERT INTO VERSION VALUES (?,?,?)", (version, period_from, period_to))

        for table, path in (
            (CENTERSTREETS_TABLE, csv_street),
            (CENTERCOMMUNITIES_TABLE, csv_communities),
            (BUILDINGS_TABLE, csv_buildings),
            (ADDITIONALCOMMUNITIES_TABLE, csv_additional),
            (YEAR_GROUPS_TABLE, csv_yeargroups),
        ):
            start = time.monotonic()
            count = create_table_and_insert(conn, table, path, encoding, progress)
            counts[table["name"]] = count
            if phase_done:
                phase_done(table["name"], path, count, time.monotonic() - start)
    finally:
        conn.close()
    return counts


# ---------------------------------------------------------------------------
# Post checks (port of checkDoubles / checkKFactor)
# ---------------------------------------------------------------------------

DOUBLES_QUERIES = [
    ("Buildings",
     "SELECT street,street_number,zip_code,community,COUNT(street) count "
     "FROM BUILDINGS GROUP BY street,street_number,zip_code,community "
     "HAVING (COUNT(street) > 1)"),
    ("CenterStreets",
     "SELECT street,zip_code,community,COUNT(street) count "
     "FROM CENTERSTREETS GROUP BY street,zip_code,community "
     "HAVING (COUNT(street) > 1)"),
    ("CenterCommunities",
     "SELECT zip_code,community,COUNT(zip_code) count "
     "FROM CENTERCOMMUNITIES GROUP BY zip_code,community "
     "HAVING (COUNT(zip_code) > 1)"),
]


def check_doubles(database):
    """Report duplicate location keys; each duplicate group is warn-logged."""
    counts = {}
    conn = sqlite3.connect(database)
    try:
        for label, query in DOUBLES_QUERIES:
            cursor = conn.execute(query)
            columns = [description[0] for description in cursor.description]
            total = 0
            for row in cursor:
                record = dict(zip(columns, row))
                log.warning("Double %s:%s", label,
                            json.dumps(record, ensure_ascii=False, separators=(",", ":")))
                total += record["count"]
            counts[label] = total
    finally:
        conn.close()
    return counts


DEFAULT_YEAR_GROUPS = [(1918, 1), (1945, 2), (1970, 3), (1990, 4), (2005, 5), (2015, 6)]

LOCATION_ATTRS = (
    "canton || ' ' ||major_statistical_region||' '||"
    "second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||"
    "' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '"
    "||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '"
    "||distance_to_highvoltage_powerlines"
)


def build_year_case_expression(year_groups):
    if not year_groups:
        return "year_of_construction"
    sql = "CASE WHEN year_of_construction = '' THEN ''"
    for max_year, code in year_groups:
        sql += f" WHEN CAST(year_of_construction AS INTEGER) <= {max_year} THEN '{code}'"
    last_code = year_groups[-1][1] + 1
    sql += f" ELSE '{last_code}' END"
    return sql


def check_k_factor(database):
    """True iff every year-group+location category holds >= 3 buildings."""
    conn = sqlite3.connect(database)
    try:
        try:
            year_groups = conn.execute(
                "SELECT max_year, code FROM YEAR_GROUPS ORDER BY max_year ASC"
            ).fetchall()
            if not year_groups:
                year_groups = DEFAULT_YEAR_GROUPS
        except sqlite3.Error:
            year_groups = DEFAULT_YEAR_GROUPS

        year_expr = build_year_case_expression(year_groups)
        query = f"""SELECT
                (SELECT COUNT(CAT_BAU) FROM (
                SELECT  CAT_BAU ,COUNT(CAT_BAU)
                FROM ( SELECT  ({year_expr} || ' ' || {LOCATION_ATTRS}) AS CAT_BAU
                FROM BUILDINGS WHERE year_of_construction !='')
                GROUP BY CAT_BAU
                HAVING (COUNT(CAT_BAU) < 3))) a,

                (SELECT COUNT(CAT_LAGE) FROM (
                SELECT  CAT_LAGE ,COUNT(CAT_LAGE)
                FROM ( SELECT  ({LOCATION_ATTRS}) AS CAT_LAGE
                FROM BUILDINGS WHERE year_of_construction ='' OR ({year_expr} || ' ' || {LOCATION_ATTRS} IN (SELECT  CAT_BAU
                    FROM ( SELECT  ({year_expr} || ' ' || {LOCATION_ATTRS}) AS CAT_BAU
                    FROM BUILDINGS WHERE year_of_construction !='')
                    GROUP BY CAT_BAU
                    HAVING (COUNT(CAT_BAU) > 2)))  )
                GROUP BY CAT_LAGE
                HAVING (COUNT(CAT_LAGE) < 3))) b;"""

        a, b = conn.execute(query).fetchone()
        return (a + b) == 0
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

LOG_LEVELS = {
    "error": logging.ERROR,
    "warn": logging.WARNING,
    "info": logging.INFO,
    "verbose": logging.DEBUG,
    "debug": logging.DEBUG,
    "silly": 5,
}


def _clean_path(value):
    if value is None:
        return None
    value = value.strip()
    return value or None


def build_arg_parser():
    parser = argparse.ArgumentParser(
        prog="generate_impi_db.py",
        description="Generate the IMPI SQLite geo database from CSV input files.",
        epilog="CSV format: ';'-separated with a header row; column order does not matter.",
    )
    parser.add_argument("-V", "--version", action="version", version=VERSION)
    parser.add_argument("-g", "--geodb", metavar="<file>", help="Database filename")
    parser.add_argument("-q", "--dbversion", metavar="<version>", help="Database Version")
    parser.add_argument("-f", "--from", dest="period_from", metavar="<date>",
                        help="Database Period From [dd.MM.YYYY]")
    parser.add_argument("-t", "--to", dest="period_to", metavar="<date>",
                        help="Database Period To [dd.MM.YYYY]")
    parser.add_argument("-s", "--streetCsv", metavar="<file>",
                        help="CSV Filename to Street InputFile")
    parser.add_argument("-c", "--communitiesCsv", metavar="<file>",
                        help="CSV Filename to Communities InputFile")
    parser.add_argument("-b", "--buildingsCsv", metavar="<file>",
                        help="CSV Filename to Buildings InputFile")
    parser.add_argument("-a", "--additionalCommunitiesCsv", metavar="<file>",
                        help="CSV Filename to the additional Communities InputFile")
    parser.add_argument("-y", "--yeargroupsCsv", metavar="<file>",
                        help="CSV Filename to Year Groups InputFile (optional)")
    parser.add_argument("-C", "--config", metavar="<file>", help="JSON Config File")
    parser.add_argument("-l", "--LogLevel", dest="log_level", default="info",
                        choices=sorted(LOG_LEVELS), help="LogLevel (default: info)")
    parser.add_argument("-e", "--encoding", default="windows1252",
                        help="the encoding used in the input csv file (default: windows1252)")
    return parser


def build_config(args):
    """Assemble the config dict and merge an optional JSON config file with
    the Node CLI's truthy-wins semantics (config file overrides flags)."""
    config = {
        "csv": {
            "street": _clean_path(args.streetCsv),
            "communities": _clean_path(args.communitiesCsv),
            "buildings": _clean_path(args.buildingsCsv),
            "additional": _clean_path(args.additionalCommunitiesCsv),
            "yeargroups": _clean_path(args.yeargroupsCsv),
            "encoding": _clean_path(args.encoding) or "windows1252",
        },
        "db": {
            "version": args.dbversion,
            "from": args.period_from,
            "to": args.period_to,
        },
        "output": args.geodb,
    }

    if args.config:
        with open(os.path.join(os.getcwd(), args.config), encoding="utf-8") as handle:
            config_file = json.load(handle)
        file_csv = config_file.get("csv") or {}
        for key in ("street", "communities", "buildings", "additional", "yeargroups", "encoding"):
            config["csv"][key] = file_csv.get(key) or config["csv"][key]
        file_db = config_file.get("db") or {}
        for key in ("version", "from", "to"):
            config["db"][key] = file_db.get(key) or config["db"][key]
        config["output"] = config_file.get("output") or config["output"]

    return config


def config_is_complete(config):
    return all([
        config["csv"]["street"],
        config["csv"]["communities"],
        config["csv"]["buildings"],
        config["csv"]["additional"],
        config["db"]["version"],
        config["db"]["from"],
        config["db"]["to"],
        config["output"],
    ])


def nice_time(seconds):
    if seconds < 60:
        return f"{seconds:.3f}s"
    return f"{seconds / 60:.3f}m"


class ProgressPrinter:
    """One clean console line per phase; live in-place updates on a TTY."""

    PHASES = {
        "CENTERSTREETS": "Generate CenterStreets",
        "CENTERCOMMUNITIES": "Generate CenterCommunities",
        "BUILDINGS": "Generate Buildings",
        "ADDITIONALCOMMUNITIES": "Additional PLZs",
        "YEAR_GROUPS": "YearGroups",
    }

    def __init__(self):
        self.current = None
        self.started = 0.0
        self.live_line = False

    def _finish_line(self):
        if self.live_line:
            sys.stdout.write("\n")
            self.live_line = False

    def update(self, table_name, row_count):
        label = self.PHASES.get(table_name, table_name)
        now = time.monotonic()
        if self.current != table_name:
            self._finish_line()
            self.current = table_name
            self.started = now
        elapsed = now - self.started
        rate = f"{row_count / elapsed:,.0f}" if elapsed > 0 else "-"
        if sys.stdout.isatty():
            sys.stdout.write(f"\r{label} ... {row_count:,} rows ({rate} rows/s)")
            sys.stdout.flush()
            self.live_line = True

    def phase_done(self, table_name, row_count, elapsed):
        self._finish_line()
        label = self.PHASES.get(table_name, table_name)
        rate = f", {row_count / elapsed:,.0f} rows/s" if elapsed > 0 and row_count else ""
        print(f"{label}: {row_count:,} rows in {nice_time(elapsed)}{rate}")
        self.current = None

    def line(self, text):
        self._finish_line()
        print(text)


def main(argv=None):
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    config = build_config(args)
    if not config_is_complete(config):
        parser.print_help()
        return 1

    try:
        resolve_encoding(config["csv"]["encoding"])
    except ValueError as error:
        print(error, file=sys.stderr)
        return 1

    print("Options:")
    print(json.dumps(config, indent=2))

    log_file = config["output"] + ".log"
    if os.path.exists(log_file):
        print("Deleting existing Log File:" + log_file)
        os.unlink(log_file)

    logging.addLevelName(5, "SILLY")
    handler = logging.FileHandler(log_file, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    log.addHandler(handler)
    log.setLevel(LOG_LEVELS[args.log_level])

    printer = ProgressPrinter()
    overall_start = time.monotonic()

    def phase_done(table_name, path, count, elapsed):
        if path or table_name != "YEAR_GROUPS":
            printer.phase_done(table_name, count, elapsed)

    try:
        generate(config["output"], config["db"]["version"], config["db"]["from"],
                 config["db"]["to"], config["csv"]["street"], config["csv"]["communities"],
                 config["csv"]["buildings"], config["csv"]["additional"],
                 config["csv"]["yeargroups"], config["csv"]["encoding"],
                 progress=printer.update, phase_done=phase_done)

        doubles = check_doubles(config["output"])
        printer.line("Log Doubles: Buildings={Buildings:,} CenterStreets={CenterStreets:,} "
                     "CenterCommunities={CenterCommunities:,}".format(**doubles))

        if check_k_factor(config["output"]):
            printer.line("Check K-Factor: OK")
            log.info("K-Factor Test succeed!")
        else:
            printer.line("Check K-Factor: FAILED")
            log.warning("K-Factor Test failed!")

        printer.line("Overall Time: " + nice_time(time.monotonic() - overall_start))
        return 0
    except Exception as error:  # noqa: BLE001 - single top-level error boundary
        printer.line(f"Error: {error}")
        log.error("%s", error, exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
