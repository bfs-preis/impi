#!/usr/bin/env python3
"""Compare two IMPI geo databases for logical identity.

Usage: python3 scripts/verify-db-parity.py <reference.db> <candidate.db>

Compares schema (sqlite_master DDL), per-table row counts and per-table
content hashes over typeof()+value of every column — file bytes are never
compared (page layout and SQLite version make them meaningless). Includes
storage classes so type-affinity regressions are caught (e.g. '' stored as
INTEGER instead of TEXT would break the K-Factor SQL).

Exit code 0 iff the databases are logically identical.
"""

import hashlib
import sqlite3
import sys

TABLES = {
    "VERSION": ["version", "period_from", "period_to"],
    "CENTERSTREETS": ["zip_code", "community", "street", "egid"],
    "CENTERCOMMUNITIES": ["zip_code", "community", "egid"],
    "BUILDINGS": [
        "egid", "street", "street_number", "zip_code", "community",
        "designation_of_building", "canton", "major_statistical_region",
        "community_type", "second_appartement_quota", "tax_burden",
        "travel_time_to_centers", "public_transport_quality", "noise_exposure",
        "slope", "exposure", "lake_view", "mountain_view", "distance_to_lakes",
        "distance_to_rivers", "distance_to_highvoltage_powerlines",
        "year_of_construction",
    ],
    "ADDITIONALCOMMUNITIES": ["original", "alternativ"],
    "YEAR_GROUPS": ["max_year", "code"],
}


def schema(conn):
    return conn.execute(
        "SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY type, name"
    ).fetchall()


def table_hash(conn, table, columns, order_by):
    select = ", ".join(f"typeof({c}), {c}" for c in columns)
    digest = hashlib.sha256()
    for row in conn.execute(f"SELECT {select} FROM {table} ORDER BY {order_by}"):
        digest.update(repr(row).encode())
        digest.update(b"\x00")
    return digest.hexdigest()


def show_diff(ref, cand, table, columns):
    """Print sample rows present in one DB but not the other."""
    cols = ",".join(columns)
    cand.execute("ATTACH DATABASE ? AS ref", (ref,))
    try:
        for direction, query in (
            ("only in candidate", f"SELECT {cols} FROM main.{table} EXCEPT SELECT {cols} FROM ref.{table}"),
            ("only in reference", f"SELECT {cols} FROM ref.{table} EXCEPT SELECT {cols} FROM main.{table}"),
        ):
            rows = cand.execute(query + " LIMIT 10").fetchall()
            if rows:
                print(f"    {direction} ({len(rows)} shown, may be more):")
                for row in rows:
                    print(f"      {row}")
    finally:
        cand.execute("DETACH DATABASE ref")


def main():
    if len(sys.argv) != 3:
        print(__doc__.strip())
        return 2
    ref_path, cand_path = sys.argv[1], sys.argv[2]

    ref = sqlite3.connect(f"file:{ref_path}?mode=ro", uri=True)
    cand = sqlite3.connect(f"file:{cand_path}?mode=ro", uri=True)
    failures = 0

    ref_schema, cand_schema = schema(ref), schema(cand)
    if ref_schema == cand_schema:
        print(f"schema: OK ({len(ref_schema)} entries)")
    else:
        failures += 1
        print("schema: MISMATCH")
        for entry in ref_schema:
            if entry not in cand_schema:
                print(f"  only in reference: {entry}")
        for entry in cand_schema:
            if entry not in ref_schema:
                print(f"  only in candidate: {entry}")

    for table, columns in TABLES.items():
        ref_count = ref.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        cand_count = cand.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        if ref_count != cand_count:
            failures += 1
            print(f"{table}: COUNT MISMATCH reference={ref_count:,} candidate={cand_count:,}")
            show_diff(ref_path, cand, table, columns)
            continue

        order_all = ", ".join(columns)
        content_ok = (table_hash(ref, table, columns, order_all)
                      == table_hash(cand, table, columns, order_all))
        order_ok = (table_hash(ref, table, columns, "rowid")
                    == table_hash(cand, table, columns, "rowid"))
        if content_ok and order_ok:
            print(f"{table}: OK ({ref_count:,} rows, content+order identical)")
        elif content_ok:
            failures += 1
            print(f"{table}: content identical but INSERT ORDER differs ({ref_count:,} rows)")
        else:
            failures += 1
            print(f"{table}: CONTENT MISMATCH ({ref_count:,} rows)")
            show_diff(ref_path, cand, table, columns)

    print("RESULT:", "IDENTICAL" if failures == 0 else f"{failures} MISMATCH(ES)")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
