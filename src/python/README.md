# generate_impi_db.py — Python geo-database generator

Python 3.11 port of the `generate-impi-db` CLI (`src/libs/generate-impi-geo-database`).
Builds the IMPI SQLite geo database from the prepared CSV tables. The output is
logically identical to the Node tool's: same schema, same normalized values, same
row counts — verified with `scripts/verify-db-parity.py`.

## Requirements

- Python 3.11 (or newer). **No pip packages** — standard library only.
- Deployment is a single file: copy `generate_impi_db.py` to the target machine.

## Usage

```bash
python3 generate_impi_db.py \
    -g gwrgeo.db \
    -q GWR202603 \
    -f 01.01.2025 -t 31.12.2025 \
    -s CENTER_STREET.csv \
    -c CENTER_PLZ.csv \
    -b BUILDINGS.csv \
    -a ALTERNATIVE_ZIPCODES.csv \
    [-y YEARGROUPS.csv] \
    [-e windows1252]
```

| Flag | Description |
|---|---|
| `-g, --geodb` | Output SQLite database file |
| `-q, --dbversion` | Database version string (stored in `VERSION`) |
| `-f, --from` / `-t, --to` | Database period `dd.MM.YYYY` (stored in `VERSION`) |
| `-s, --streetCsv` | CenterStreet CSV (`ZipCode;Community;Street;EGID`) |
| `-c, --communitiesCsv` | CenterCommunities CSV (`ZipCode;Community;EGID`) |
| `-b, --buildingsCsv` | Buildings CSV (22 columns, see below) |
| `-a, --additionalCommunitiesCsv` | Alternative zip codes CSV (`Original;Alternativ`) |
| `-y, --yeargroupsCsv` | Year groups CSV (`MaxYear;Code`), optional |
| `-C, --config` | JSON config file; its values override the CLI flags |
| `-l, --LogLevel` | `error`, `warn`, `info` (default), `verbose`, `debug`, `silly` |
| `-e, --encoding` | Input encoding: `windows1252` (default), `utf8`, `iso88591`, `macintosh` |

CSV files are `;`-separated with a header row. Column order does not matter and
extra columns are ignored; headers are matched case-insensitively. Street, city
and street-number values are normalized during import (identical rules to the
Node tool / impilib matching).

### Config file (`-C`)

Same format as the Node tool; values present in the file win over CLI flags:

```json
{
  "csv": {
    "street": "CENTER_STREET.csv",
    "communities": "CENTER_PLZ.csv",
    "buildings": "BUILDINGS.csv",
    "additional": "ALTERNATIVE_ZIPCODES.csv",
    "yeargroups": "YEARGROUPS.csv",
    "encoding": "windows1252"
  },
  "db": { "version": "GWR202603", "from": "01.01.2025", "to": "31.12.2025" },
  "output": "gwrgeo.db"
}
```

## Output

- `<geodb>` — the SQLite database (tables `VERSION`, `CENTERSTREETS`,
  `CENTERCOMMUNITIES`, `BUILDINGS`, `ADDITIONALCOMMUNITIES`, `YEAR_GROUPS`)
- `<geodb>.log` — file log (skipped rows, duplicate groups, K-Factor result);
  a pre-existing log file is deleted at startup

After the import, the tool reports duplicate location keys ("Log Doubles") and
runs the K-Factor check (every year-group + location category must contain at
least 3 buildings; year groups come from `YEAR_GROUPS` or built-in defaults).
Neither check fails the run; a hard error during generation exits with code 1.

## Tests

```bash
cd src/python
python3 -m unittest discover -v tests
```

## Verifying parity with the Node tool

Build the same database with both tools, then:

```bash
python3 scripts/verify-db-parity.py <node-built.db> <python-built.db>
```

The script compares schema DDL, row counts and per-table content hashes
(including SQLite storage classes) and exits 0 only if the databases are
logically identical.
