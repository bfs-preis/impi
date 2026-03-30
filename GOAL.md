# IMPI — Project Goal

## Mission

IMPI (Immobilienpreisindex / Swiss Real Estate Price Index) enables organizations holding confidential real estate transaction data to contribute to national statistics **without exposing sensitive information**.

## The Problem

The Swiss Federal Statistical Office (BFS) needs real estate transaction data from banks and other organizations to compute the national real estate price index. However, this data contains confidential information (exact addresses, transaction prices, property details) that organizations cannot share directly.

## The Solution

IMPI is a **local-first, offline-capable desktop tool** that runs entirely on the organization's own infrastructure. It:

1. **Enriches** transaction records with standardized geographic attributes from a reference geodatabase (canton, statistical region, community type, environmental factors, etc.)
2. **Validates** data quality against 50 rules, flagging issues without rejecting records
3. **Categorizes** sensitive fields (e.g. exact construction year → period category)
4. **Packages** the enriched output as a ZIP with an XML processing log
5. **Generates** a Sedex envelope for secure Swiss administrative data transmission

## Trust Model

Organizations can trust the process because:

- **Open source** — the entire codebase is public and auditable
- **Runs locally** — no data leaves the machine during processing; the tool works fully offline
- **K-factor verification** — built-in statistical disclosure check ensures no output cell has fewer than 3 records, preventing re-identification
- **Transparent logging** — every processing run produces a detailed XML log showing exactly what happened to each record
- **No network access** — the Electron app has no outbound network calls; output is a local file

## What IMPI is NOT

- It is not a web service or cloud tool
- It does not transmit data — it only produces local output files
- It does not remove fields from the input — it enriches and categorizes them
- It is not a general-purpose anonymization tool — it is purpose-built for the Swiss real estate price index workflow

## Supporting Tools

| Component | Purpose |
|-----------|---------|
| **impilib** | Core processing library (validation, matching, enrichment) |
| **Electron app** | Desktop GUI for interactive use |
| **CLI** | Headless batch processing for automation |
| **Result Viewer** | Visualization of processing results (charts, validation stats) |
| **generate-impi-geo-database** | Builds the reference geodatabase from CSV source data |
| **normalize-\*** | Swiss multilingual address normalization (DE/FR/IT) |
