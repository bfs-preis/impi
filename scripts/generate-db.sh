#!/usr/bin/env bash
#
# Generate the GWR geo database from the BFS source data using a released
# generate-impi-geo-database binary.
#
# Downloads the generate-impi-geo-database artifact from a GitHub release
# (latest by default) and runs it against the BFS CSV files in
# test-data-bfs/, producing a SQLite .db file.
#
# Usage:
#   ./scripts/generate-db.sh [-o OUTPUT_DB] [-d DATA_DIR] [TAG]
#
# Options:
#   -o OUTPUT_DB   Output database path (default: ./gwrgeo.db)
#   -d DATA_DIR    Directory holding the BFS CSV files (default: ./test-data-bfs)
#
# Examples:
#   ./scripts/generate-db.sh                       # latest release -> ./gwrgeo.db
#   ./scripts/generate-db.sh v2.0.0-rc.1           # a specific release
#   ./scripts/generate-db.sh -o /tmp/geo.db v2.0.0-rc.1
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GH_REPO="$(cd "$REPO_DIR" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "bfs-preis/impi")"

OUTPUT_DB="$REPO_DIR/gwrgeo.db"
DATA_DIR="$REPO_DIR/test-data-bfs"
while getopts "o:d:h" opt; do
    case "$opt" in
        o) OUTPUT_DB="$OPTARG" ;;
        d) DATA_DIR="$OPTARG" ;;
        h) sed -n '2,25p' "$0"; exit 0 ;;
        *) exit 1 ;;
    esac
done
shift $((OPTIND - 1))
RELEASE_TAG="${1:-}"

info() { echo -e "\033[1;34m$1\033[0m"; }
ok()   { echo -e "  \033[32m✓\033[0m $1"; }
die()  { echo -e "  \033[31m✗\033[0m $1" >&2; exit 1; }

# --- Locate the BFS source CSVs ----------------------------------------------

STREET_CSV="$DATA_DIR/_20260311_CENTER_STREET.csv"
PLZ_CSV="$DATA_DIR/_20260311_CENTER_PLZ.csv"
BUILDINGS_CSV="$DATA_DIR/_20260311_BUILDINGS.csv"
ALTERNATIVE_CSV="$DATA_DIR/_20260311_ALTERNATIVE_ZIPCODES.csv"

for f in "$STREET_CSV" "$PLZ_CSV" "$BUILDINGS_CSV" "$ALTERNATIVE_CSV"; do
    [ -f "$f" ] || die "Missing BFS input file: $f"
done

WORK_DIR="$(mktemp -d)"
cleanup() { rm -rf "$WORK_DIR"; }
trap cleanup EXIT

# --- Resolve the release tag -------------------------------------------------

if [ -z "$RELEASE_TAG" ]; then
    # Prefer the newest release (draft or published) that ships the artifact.
    RELEASE_TAG=$(gh api "repos/$GH_REPO/releases" \
        --jq '[.[] | select(.assets | any(.name | test("generate-impi-geo-database")))] | .[0].tag_name // empty' \
        2>/dev/null || true)
    [ -n "$RELEASE_TAG" ] || die "No release found with a generate-impi-geo-database artifact"
fi

info "Generating database from release: $RELEASE_TAG"
echo "  Repo:     $GH_REPO"
echo "  Data dir: $DATA_DIR"
echo "  Output:   $OUTPUT_DB"
echo ""

# --- Download the generate-db artifact ---------------------------------------

info "[1/2] Downloading generate-impi-geo-database..."
cd "$WORK_DIR"
gh release download --repo "$GH_REPO" "$RELEASE_TAG" \
    --pattern "generate-impi-geo-database-linux-x64.tar.gz" \
    --clobber 2>/dev/null \
    || die "Could not download generate-impi-geo-database-linux-x64.tar.gz from $RELEASE_TAG"

tar -xzf generate-impi-geo-database-linux-x64.tar.gz
ok "Downloaded and extracted"

# Locate the generator. The current artifact is a standalone pkg executable
# (embedded Node) inside the extracted folder, shipped next to its native
# better-sqlite3 sidecar. Older layouts (a top-level binary, or a .cjs run via
# node) are still tolerated for backwards compatibility.
gen_bin=""
if [ -f generate-impi-geo-database-linux-x64/generate-impi-db ]; then
    chmod +x generate-impi-geo-database-linux-x64/generate-impi-db
    gen_bin="./generate-impi-geo-database-linux-x64/generate-impi-db"
elif [ -f generate-impi-geo-database-linux-x64 ]; then
    chmod +x generate-impi-geo-database-linux-x64
    gen_bin="./generate-impi-geo-database-linux-x64"
elif [ -f generate-impi-geo-database-linux-x64/generate-impi-db.cjs ]; then
    gen_bin="node generate-impi-geo-database-linux-x64/generate-impi-db.cjs"
else
    die "Unexpected artifact layout; could not find generate-db binary"
fi

# --- Generate the database ---------------------------------------------------
# BFS source CSVs are ISO-8859-1 / windows1252 encoded.
#
# Note: the v2.0.0-rc.1 release binary crashes in the post-build K-Factor
# sanity check (fixed later on develop). All data tables are written before
# that check runs, so we tolerate a non-zero exit and validate the DB
# ourselves below.

info "[2/2] Generating database (this can take a few minutes)..."
gen_rc=0
$gen_bin \
    --geodb "$OUTPUT_DB" \
    --dbversion "GWR202603" \
    --from "01.01.2025" \
    --to "31.12.2025" \
    --streetCsv "$STREET_CSV" \
    --communitiesCsv "$PLZ_CSV" \
    --buildingsCsv "$BUILDINGS_CSV" \
    --additionalCommunitiesCsv "$ALTERNATIVE_CSV" \
    --encoding windows1252 || gen_rc=$?

echo ""
[ "$gen_rc" -eq 0 ] || echo -e "  \033[33m!\033[0m generator exited with code $gen_rc (post-build check); validating DB..."

# Validate the result independent of the generator's exit code.
if [ ! -f "$OUTPUT_DB" ] || [ "$(stat -c%s "$OUTPUT_DB" 2>/dev/null || echo 0)" -lt 1000 ]; then
    die "Database generation failed (missing or too small)"
fi

node -e '
const path = process.argv[1], dbPath = process.argv[2];
const Database = require(path);
const db = new Database(dbPath, { readonly: true });
const want = ["BUILDINGS","CENTERSTREETS","CENTERCOMMUNITIES","ADDITIONALCOMMUNITIES","VERSION"];
let bad = false;
for (const t of want) {
  let n;
  try { n = db.prepare("SELECT COUNT(*) c FROM \"" + t + "\"").get().c; }
  catch (e) { console.log("  missing table: " + t); bad = true; continue; }
  console.log("  " + t + ": " + n);
  if (n === 0) { console.log("  -> table " + t + " is empty"); bad = true; }
}
db.close();
process.exit(bad ? 1 : 0);
' "$REPO_DIR/src/libs/generate-impi-geo-database/node_modules/better-sqlite3" "$OUTPUT_DB" \
    || die "Database is missing expected tables"

ok "Database created: $OUTPUT_DB ($(stat -c%s "$OUTPUT_DB") bytes)"
