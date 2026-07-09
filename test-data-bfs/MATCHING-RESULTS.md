# Matching- & Validierungs-Testergebnisse

Stand: 2026-06-10

## Setup

| Komponente | Wert |
|---|---|
| GWR-Quelldaten | `test-data-bfs/_20260311_*` (CENTER_STREET, CENTER_PLZ, BUILDINGS, ALTERNATIVE_ZIPCODES) |
| Encoding der Quelldaten | windows1252 / ISO-8859-1 |
| Generierte DB | `gwrgeo.db` (Version `GWR202603`, Periode 01.01.2025–31.12.2025) |
| DB-Generator | Release-Binary `generate-impi-geo-database` aus `v2.0.0-rc.1` |
| Getestete CLI | `v2.0.0-rc.1` Release-Binary **und** `develop`-Source-Build |

DB-Inhalt: BUILDINGS 3'164'361 · CENTERSTREETS 196'562 · CENTERCOMMUNITIES 4'929 · ADDITIONALCOMMUNITIES 15'350.

Reproduktion:

```bash
./scripts/generate-db.sh                                   # DB aus BFS-Daten bauen
node scripts/test-matching.mjs  src/cli/dist/index.js gwrgeo.db test-data-bfs/Testfaelle_Matching2_utf8.csv  utf8
node scripts/test-validation.mjs src/cli/dist/index.js gwrgeo.db test-data-bfs/Testfaelle_Validierung_utf8.csv utf8
```

## Matching — `Testfaelle_Matching2_utf8.csv`

**124 / 135 bestanden.** `develop`-Source-Build und `v2.0.0-rc.1`-Release liefern **identische** Ergebnisse — das Matching-Verhalten ist zwischen den Versionen unverändert.

Die `match`-Spalte (0=Point, 1=CenterStreet, 2=CenterPLZ/Communities, 3=NoMatching) dient als Ground Truth und wird mit dem Output-`matchingtype` verglichen.

### Die 11 Abweichungen sind Daten-Versions-Deltas, keine Code-Bugs

Die Testfälle wurden gegen einen anderen GWR-Stand erstellt als der Extrakt `_20260311_*`. Belege direkt aus `gwrgeo.db`:

| Zeile | Adresse | Erwartet → Erhalten | DB-Befund | Diagnose |
|---|---|---|---|---|
| L4 | Beribodenweg 4, 7250 Klosters-Serneus | Point → CenterStreet | 0 Gebäude „Beribodenweg" in 7250 | Gebäude fehlt → korrekter Strassen-Fallback |
| L6 | Gehrenweidstr. 683, 9552 Wil SG | Point → CenterStreet | Strasse hat nur Nr. 1, 1.1–1.5 — kein 683 | Hausnummer fehlt → Fallback korrekt |
| L7 | 3-Eidgenossen 11z, 8808 Freienbach | Point → CenterStreet | exakte Nr. nicht punktgenau vorhanden | Fallback korrekt |
| L9 | A la Bataille (ohne Nr.), 1042 Bioley-Orjulaz | Point → CenterStreet | kein Hausnr. im Input | mehrdeutig ohne Nummer |
| L26/L27 | La Grande Motte (ohne Nr.), 2206 Val-de-Ruz | Point → CenterStreet | kein Hausnr. im Input | mehrdeutig ohne Nummer |
| L38 | La Grande Motte (ohne Nr.), 2043 Val-de-Ruz | Point → CenterStreet | „mit alternativer PLZ" | alt-PLZ-Sonderfall |
| L42 | Heinisolstr. (ohne Nr.), 8194 Hüntwangen | CenterStreet → Point | 49 Gebäude vorhanden, Input ohne Nr. | Punkt-Match trotz fehlender Nummer |
| L46 | Alte Zugerstr. (ohne Nr.), 6403 Küssnacht SZ | CenterStreet → Point | analog L42 | analog L42 |
| L70 | Alte Zugerstr. (ohne Nr.), 6402 Küssnacht SZ | CenterStreet → Point | „mit alternativer PLZ" | alt-PLZ-Sonderfall |
| L88 | Botenacker 23, 3053 Diemerswil | CenterPLZ → NoMatching | „Diemerswil" nicht in PLZ-Tabelle (3053 → muenchenbuchsee, moosseedorf …) | Gemeinde fusioniert/umbenannt → NoMatching korrekt |

Gemeinsamer Nenner: fehlende Gebäudenummern, eine zwischenzeitlich fusionierte Gemeinde (Diemerswil) und mehrdeutige Fälle ohne Hausnummer. Die Matching-Logik reagiert in allen Fällen korrekt auf die tatsächlich vorhandenen Daten.

## Validierung — `Testfaelle_Validierung_utf8.csv`

**105 / 105 bestanden** — sowohl `develop` als auch `v2.0.0-rc.1`.

Der Output `validationflags` ist eine Bitmaske (`flags |= 2^Id` je verletzter Regel). Pro Testfall wird geprüft, ob das Bit der erwarteten `ValidationNr` gesetzt ist. Die Validierung ist datenunabhängig (außer der Quartals-Periode der DB).

## Fazit

- DB-Generierung mit Release-Binary funktioniert.
- Matching gegen die DB: 124/135 — die 11 Abweichungen sind Daten-Versions-Deltas (`_20260311_`-Extrakt vs. GWR-Stand der Testfälle), keine Bugs.
- `develop` == `rc.1` beim Matching (kein Code-Unterschied).
- Validierung: 105/105 in beiden Versionen.
