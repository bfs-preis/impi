#!/usr/bin/env bash
#
# E2E test for IMPI release artifacts.
#
# Downloads release binaries, generates a GWR database from synthetic
# fixtures, and tests both CLI and Electron (AppImage) against it.
#
# Usage:
#   ./scripts/e2e-test.sh [TAG]
#
# Examples:
#   ./scripts/e2e-test.sh v2.0.0-rc.23   # test specific release
#   ./scripts/e2e-test.sh                  # test latest draft release
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FIXTURES_DIR="$REPO_DIR/test-data/fixtures"
WORK_DIR="$(mktemp -d)"
RELEASE_TAG="${1:-}"
GH_REPO="$(cd "$REPO_DIR" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "bfs-preis/impi")"
PASSED=0
FAILED=0

cleanup() {
    rm -rf "$WORK_DIR"
}
trap cleanup EXIT

info()  { echo -e "\033[1;34m$1\033[0m"; }
ok()    { echo -e "  \033[32m✓\033[0m $1"; PASSED=$((PASSED + 1)); }
fail()  { echo -e "  \033[31m✗\033[0m $1"; FAILED=$((FAILED + 1)); }
check() {
    if eval "$1"; then
        ok "$2"
    else
        fail "$2"
    fi
}

# --- 1. Download release artifacts -------------------------------------------

download_artifacts() {
    info "[1/5] Downloading release artifacts..."

    local dl_args=()
    if [ -n "$RELEASE_TAG" ]; then
        dl_args+=("$RELEASE_TAG")
    else
        # Find latest draft release
        RELEASE_TAG=$(gh api repos/$GH_REPO/releases --jq '[.[] | select(.draft)] | .[0].tag_name // empty' 2>/dev/null || true)
        if [ -z "$RELEASE_TAG" ]; then
            RELEASE_TAG=$(gh release list --repo "$GH_REPO" --limit 1 --json tagName -q '.[0].tagName')
        fi
        dl_args+=("$RELEASE_TAG")
    fi

    echo "  Release: $RELEASE_TAG"

    cd "$WORK_DIR"

    # Download CLI and generate-db from the target release
    gh release download --repo "$GH_REPO" "${dl_args[@]}" \
        --pattern "generate-impi-geo-database-linux-x64.tar.gz" \
        --pattern "impi-cli-linux-x64.tar.gz" \
        --clobber 2>/dev/null || true

    # Download Electron AppImage — electron-builder publishes to a release
    # matching the package.json version, not the git tag
    local version
    version=$(gh api repos/$GH_REPO/releases --jq '[.[] | select(.assets | any(.name | test("AppImage")))] | .[0].tag_name // empty' 2>/dev/null || true)
    if [ -n "$version" ]; then
        echo "  Electron release: $version"
        gh release download --repo "$GH_REPO" "$version" \
            --pattern "*.AppImage" \
            --clobber 2>/dev/null || true
    fi

    # Extract tarballs
    for f in *.tar.gz; do
        [ -f "$f" ] && tar -xzf "$f" && rm "$f"
    done

    check '[ -d generate-impi-geo-database-linux-x64 ] || [ -f generate-impi-geo-database-linux-x64 ]' "Downloaded generate-impi-geo-database"
    check '[ -d impi-cli-linux-x64 ] || [ -f impi-cli-linux-x64 ]' "Downloaded impi-cli"
    check 'ls *mpi*.AppImage >/dev/null 2>&1 || ls *MPI*.AppImage >/dev/null 2>&1' "Downloaded Electron AppImage"
}

# --- 2. Generate GWR database ------------------------------------------------

generate_database() {
    info "[2/5] Generating GWR test database..."

    cd "$WORK_DIR"

    local gen_args=(
        --geodb test-geo.db
        --dbversion "TEST001"
        --from "01.01.2025"
        --to "31.12.2025"
        --streetCsv "$FIXTURES_DIR/centerstreets.csv"
        --communitiesCsv "$FIXTURES_DIR/centercommunities.csv"
        --buildingsCsv "$FIXTURES_DIR/buildings.csv"
        --additionalCommunitiesCsv "$FIXTURES_DIR/additionalcommunities.csv"
        --yeargroupsCsv "$FIXTURES_DIR/yeargroups.csv"
        --encoding utf8
    )

    local gen_bin=""
    if [ -f generate-impi-geo-database-linux-x64 ]; then
        gen_bin="./generate-impi-geo-database-linux-x64"
    elif [ -f generate-impi-geo-database-linux-x64/generate-impi-db.cjs ]; then
        gen_bin="node generate-impi-geo-database-linux-x64/generate-impi-db.cjs"
    fi

    if [ -n "$gen_bin" ]; then
        $gen_bin "${gen_args[@]}" 2>&1 | tail -5 || true
        if [ ! -f test-geo.db ] || [ "$(stat -c%s test-geo.db 2>/dev/null || echo 0)" -lt 1000 ]; then
            fail "generate-impi-geo-database release artifact failed"
            echo "  Falling back to source build..."
            _generate_from_source "${gen_args[@]}"
        else
            ok "generate-impi-geo-database release artifact works"
        fi
    else
        fail "generate-impi-geo-database artifact not found"
        _generate_from_source "${gen_args[@]}"
    fi

    check '[ -f test-geo.db ]' "Database file created"
    check '[ "$(stat -c%s test-geo.db 2>/dev/null || stat -f%z test-geo.db 2>/dev/null)" -gt 0 ]' "Database is non-empty"
}

_generate_from_source() {
    # Build and run from source as fallback
    echo "  Building generate-impi-geo-database from source..."
    (cd "$REPO_DIR/src" && pnpm --filter normalize-common --filter normalize-street --filter normalize-city --filter generate-impi-geo-database run build) >/dev/null 2>&1
    node "$REPO_DIR/src/libs/generate-impi-geo-database/dist/generate-impi-db-cli.js" "$@" 2>&1 | tail -5 || true
    echo "  (used source build)"
}

# --- 3. Test CLI --------------------------------------------------------------

test_cli() {
    info "[3/5] Testing CLI binary..."

    cd "$WORK_DIR"
    mkdir -p cli-output

    local cli_args=(
        --db test-geo.db
        --csv "$FIXTURES_DIR/test-input.csv"
        --out cli-output
        --enc utf8
        --sep ";"
        -l info
    )

    local cli_bin=""
    if [ -f impi-cli-linux-x64 ]; then
        cli_bin="./impi-cli-linux-x64"
    elif [ -f impi-cli-linux-x64/impi-cli.cjs ]; then
        cli_bin="node impi-cli-linux-x64/impi-cli.cjs"
    fi

    if [ -n "$cli_bin" ]; then
        if $cli_bin "${cli_args[@]}" 2>&1 | tail -10; then
            ok "impi-cli release artifact works"
        else
            fail "impi-cli release artifact failed"
            echo "  Falling back to source build..."
            _run_cli_from_source "${cli_args[@]}"
        fi
    else
        fail "impi-cli artifact not found"
        _run_cli_from_source "${cli_args[@]}"
    fi

    local zip
    zip=$(ls cli-output/data_*.zip 2>/dev/null | head -1)

    check '[ -n "$zip" ] && [ -f "$zip" ]' "CLI produced output ZIP"

    if [ -n "$zip" ] && [ -f "$zip" ]; then
        # Extract and validate contents
        mkdir -p cli-output/extracted
        unzip -o "$zip" -d cli-output/extracted >/dev/null 2>&1

        check 'ls cli-output/extracted/data_*.csv >/dev/null 2>&1' "ZIP contains data CSV"
        check 'ls cli-output/extracted/log*.xml >/dev/null 2>&1' "ZIP contains log.xml"

        # Check for matches in log.xml
        local log_xml=$(ls cli-output/extracted/log*.xml 2>/dev/null | head -1)
        if [ -n "$log_xml" ]; then
            local match_count
            match_count=$(grep -o 'Name="PointMatching"' "$log_xml" | wc -l || echo 0)
            check '[ "$match_count" -gt 0 ]' "log.xml contains PointMatching entries"

            # Check output CSV has enriched columns
            local data_csv
            data_csv=$(ls cli-output/extracted/data_*.csv 2>/dev/null | head -1)
            if [ -n "$data_csv" ]; then
                check 'head -1 "$data_csv" | grep -qi "canton"' "Output CSV has enriched column 'canton'"
                check 'head -1 "$data_csv" | grep -qi "matchingtype"' "Output CSV has 'matchingtype' column"
            fi
        fi
    fi
}

# --- 4. Test Electron AppImage ------------------------------------------------

test_electron() {
    info "[4/5] Testing Electron AppImage..."
    set +e

    cd "$WORK_DIR"

    local appimage
    appimage=$(find . -maxdepth 1 -name "*.AppImage" -print -quit)

    if [ -z "$appimage" ] || [ ! -f "$appimage" ]; then
        echo "  No AppImage found, skipping Electron tests"
        return
    fi

    # Extract AppImage (avoids FUSE requirement)
    chmod +x "$appimage"
    ./"$appimage" --appimage-extract > /tmp/appimage-extract.log 2>&1 || true

    check '[ -d squashfs-root ]' "AppImage extracted"

    if [ ! -d squashfs-root ]; then
        fail "Cannot test Electron without extracted AppImage"
        return
    fi

    mkdir -p electron-output

    # Find the electron binary inside the extracted AppImage
    local electron_bin=""
    for name in impi IMPI; do
        if [ -x "squashfs-root/$name" ]; then
            electron_bin="squashfs-root/$name"
            break
        fi
    done

    if [ -z "$electron_bin" ]; then
        fail "Cannot find Electron binary in extracted AppImage"
        return
    fi

    # Run Electron in headless CLI mode
    setsid env -u DISPLAY -u WAYLAND_DISPLAY "$electron_bin" cli \
        --db "$WORK_DIR/test-geo.db" \
        --csv "$FIXTURES_DIR/test-input.csv" \
        --out "$WORK_DIR/electron-output" \
        --enc utf8 \
        --sep ";" \
        -l info \
        --no-sandbox \
        --disable-gpu \
        >"$WORK_DIR/electron.log" 2>&1 &
    local epid=$!
    sleep 20
    kill -- -"$epid" 2>/dev/null
    sleep 1
    kill -9 -- -"$epid" 2>/dev/null
    wait 2>/dev/null
    tail -3 "$WORK_DIR/electron.log" 2>/dev/null

    local zip
    zip=$(ls electron-output/data_*.zip 2>/dev/null | head -1)

    check '[ -n "$zip" ] && [ -f "$zip" ]' "Electron produced output ZIP"

    if [ -n "$zip" ] && [ -f "$zip" ]; then
        mkdir -p electron-output/extracted
        unzip -o "$zip" -d electron-output/extracted >/dev/null 2>&1

        check 'ls electron-output/extracted/data_*.csv >/dev/null 2>&1' "ZIP contains data CSV"
        check 'ls electron-output/extracted/log*.xml >/dev/null 2>&1' "ZIP contains log.xml"

        local elog_xml=$(ls electron-output/extracted/log*.xml 2>/dev/null | head -1)
        if [ -n "$elog_xml" ]; then
            local match_count
            match_count=$(grep -o 'Name="PointMatching"' "$elog_xml" | wc -l || echo 0)
            check '[ "$match_count" -gt 0 ]' "log.xml contains PointMatching entries"
        fi
    fi
    set -e
}

_run_cli_from_source() {
    echo "  Building CLI from source..."
    (cd "$REPO_DIR/src" && pnpm --filter normalize-common --filter normalize-street --filter normalize-city --filter impilib run build && pnpm run build:cli) >/dev/null 2>&1
    node "$REPO_DIR/src/cli/dist/index.js" "$@" 2>&1 | tail -10
    echo "  (used source build)"
}

# --- 5. Summary ---------------------------------------------------------------

summary() {
    info "[5/5] Results"
    echo ""
    echo "  Passed: $PASSED"
    echo "  Failed: $FAILED"
    echo ""

    if [ "$FAILED" -gt 0 ]; then
        echo -e "\033[31mE2E tests FAILED\033[0m"
        exit 1
    else
        echo -e "\033[32mAll E2E tests passed!\033[0m"
    fi
}

# --- Main ---------------------------------------------------------------------

main() {
    echo ""
    echo "IMPI E2E Test"
    echo "============="
    echo "  Work dir: $WORK_DIR"
    echo ""

    download_artifacts
    generate_database
    test_cli
    test_electron
    summary
}

main
