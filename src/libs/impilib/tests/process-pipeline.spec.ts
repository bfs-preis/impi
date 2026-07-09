import { expect } from 'chai';
import 'mocha';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import sqlite3pkg from 'sqlite3';
import StreamZip from 'node-stream-zip';
import bigInt from 'big-integer';
import { processFile, IProcessOption } from '../src/core/process.js';
import { ILogResult } from '../src/core/log-result.js';
import { MatchingTypeEnum } from '../src/match/match.js';

/**
 * End-to-end pipeline test: a real mini geo database (sqlite3) plus a small
 * input CSV are run through processFile, then the produced ZIP (output CSV +
 * XML log) and the ILogResult are verified.
 */

const GEO_ATTRS = {
    canton: 1, major_statistical_region: 2, community_type: 3,
    second_appartement_quota: 4, tax_burden: 5, travel_time_to_centers: 6,
    public_transport_quality: 7, noise_exposure: 8, slope: 9, exposure: 10,
    lake_view: 11, mountain_view: 12, distance_to_lakes: 13,
    distance_to_rivers: 14, distance_to_highvoltage_powerlines: 15,
};

function createGeoDatabase(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3pkg.Database(file, (openErr) => {
            if (openErr) return reject(openErr);
            const attrVals = Object.values(GEO_ATTRS).join(',');
            db.serialize(() => {
                db.run("CREATE TABLE VERSION (version TEXT,period_from TEXT,period_to TEXT)");
                db.run("INSERT INTO VERSION VALUES ('TEST1','01.01.2025','31.03.2025')");
                db.run("CREATE TABLE YEAR_GROUPS (max_year INTEGER,code INTEGER)");
                db.run("CREATE TABLE CENTERSTREETS (zip_code INTEGER,community TEXT,street TEXT,egid INTEGER)");
                db.run("CREATE TABLE CENTERCOMMUNITIES (zip_code INTEGER,community TEXT,egid INTEGER)");
                db.run("CREATE TABLE ADDITIONALCOMMUNITIES (original INTEGER,alternativ INTEGER)");
                db.run(`CREATE TABLE BUILDINGS (egid INTEGER,street TEXT,street_number TEXT,zip_code INTEGER,
                        community TEXT,designation_of_building TEXT,${Object.keys(GEO_ATTRS).join(' INTEGER,')} INTEGER,
                        year_of_construction INTEGER)`);
                // normalized values, as the geo DB generator would store them
                db.run(`INSERT INTO BUILDINGS VALUES (145482,'wannerstr','33',8045,'zuerich','',${attrVals},1998)`);
                db.run(`INSERT INTO BUILDINGS VALUES (145488,'wannerstr','45',8045,'zuerich','',${attrVals},1950)`,
                    (runErr: Error | null) => runErr ? reject(runErr) : db.close((closeErr) => closeErr ? reject(closeErr) : resolve()));
            });
        });
    });
}

const CSV_HEADER = 'transactiondate;price;street;streetnumber;zipcode;community;objecttype;'
    + 'singlefamilyhousetype;condominiumtype;primaryorsecondaryhome;owneroccupiedorrented;'
    + 'yearofconstruction;landarea;volumeofbuilding;standardofvolume;netlivingarea;'
    + 'numberofrooms;numberofbathrooms;numberofparkings;constructionquality;propertycondition;egid';

// A row that violates no validation rule (when egid is set) and point-matches
// the fixture building.
function makeRow(overrides: Record<string, string> = {}): string {
    const row: Record<string, string> = {
        transactiondate: '15.02.2025', price: '500000', street: 'Wannerstrasse',
        streetnumber: '33', zipcode: '8045', community: 'Zürich', objecttype: '1',
        singlefamilyhousetype: '1', condominiumtype: '', primaryorsecondaryhome: '1',
        owneroccupiedorrented: '1', yearofconstruction: '2000', landarea: '200',
        volumeofbuilding: '800', standardofvolume: '2', netlivingarea: '',
        numberofrooms: '4', numberofbathrooms: '1', numberofparkings: '1',
        constructionquality: '2', propertycondition: '2', egid: '145482',
        ...overrides,
    };
    return CSV_HEADER.split(';').map((column) => row[column]).join(';');
}

describe('processFile pipeline (fixture geo DB)', function () {
    this.timeout(30000);

    let workDir: string;
    let result: ILogResult;
    let outCsvRows: Record<string, string>[];
    let outCsvHeader: string[];

    before(async () => {
        workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'impi-pipeline-'));
        const dbFile = path.join(workDir, 'geo.db');
        await createGeoDatabase(dbFile);

        const inputCsv = path.join(workDir, 'input.csv');
        const rows = [
            makeRow(),                                        // 1: EGID + point identical -> 5
            makeRow({ egid: '' }),                            // 2: point match, EGID missing -> 0, flag 51
            makeRow({ egid: 'abc' }),                         // 3: point match, EGID malformed -> 0, flag 52
            makeRow({ zipcode: '' }),                         // 4: EGID only -> 9, flag 11 (zipcode missing)
            makeRow({ egid: '145488' }),                      // 5: EGID vs point conflict -> 6, point wins
        ];
        fs.writeFileSync(inputCsv, [CSV_HEADER, ...rows].join('\n') + '\n', 'utf8');

        const options: IProcessOption = {
            InputCsvFile: inputCsv,
            CsvEncoding: 'utf8',
            CsvSeparator: ';',
            DatabaseFile: dbFile,
            OutputPath: workDir,
            DbVersion: 'TEST1',
            DbPeriodFrom: new Date(2025, 0, 1).getTime(),
            DbPeriodTo: new Date(2025, 2, 31).getTime(),
            CsvRowCount: rows.length + 1,
            SedexSenderId: 'T4-000000-0',
            MappingFile: '',
            ClientVersion: 'test',
        };

        result = await new Promise<ILogResult>((resolve) => {
            processFile(options, resolve, () => { /* progress ignored */ });
        });

        // read the produced CSV back out of the ZIP
        const zip = new StreamZip.async({ file: result.Meta.OutZipFile });
        const entries = Object.values(await zip.entries());
        const csvEntry = entries.find((e) => e.name.endsWith('.csv'));
        expect(csvEntry, 'output csv inside zip').to.not.be.undefined;
        const csvText = (await zip.entryData(csvEntry!.name)).toString('utf8');
        await zip.close();

        const lines = csvText.trim().split(/\r?\n/);
        outCsvHeader = lines[0].split(';');
        outCsvRows = lines.slice(1).map((line) => {
            const cells = line.split(';');
            return Object.fromEntries(outCsvHeader.map((h, i) => [h, cells[i]]));
        });
    });

    after(() => {
        fs.rmSync(workDir, { recursive: true, force: true });
    });

    it('should finish without error and write zip + sedex envelope', () => {
        expect(result.Error).to.equal(undefined);
        expect(fs.existsSync(result.Meta.OutZipFile)).to.equal(true);
        expect(fs.existsSync(result.Meta.OutSedexFile)).to.equal(true);
    });

    it('should emit the expected output columns (no egid debug columns)', () => {
        expect(outCsvHeader).to.include.members(['validationflags', 'matchingtype', 'canton']);
        expect(outCsvHeader).to.not.include('egidprovided');
        expect(outCsvHeader).to.not.include('egidmatched');
        expect(outCsvHeader).to.not.include('addressmatched');
        expect(outCsvHeader).to.not.include('egid');
    });

    it('should assign the BFS matching codes', () => {
        expect(outCsvRows.map((r) => +r['matchingtype'])).to.deep.equal([
            MatchingTypeEnum.EGIDPointMatchingIdentical,   // 5
            MatchingTypeEnum.PointMatching,                // 0
            MatchingTypeEnum.PointMatching,                // 0
            MatchingTypeEnum.EGIDMatchingNoMatching,       // 9
            MatchingTypeEnum.EGIDPointMatchingDifferent,   // 6
        ]);
    });

    it('should set the EGID validation flags (51 missing, 52 format)', () => {
        const flags = outCsvRows.map((r) => bigInt(r['validationflags']));
        expect(flags[0].isZero(), 'row 1 has no violations').to.equal(true);
        expect(flags[1].eq(bigInt(2).pow(51)), 'row 2 -> bit 51').to.equal(true);
        expect(flags[2].eq(bigInt(2).pow(52)), 'row 3 -> bit 52').to.equal(true);
        expect(flags[3].eq(bigInt(2).pow(11)), 'row 4 -> bit 11 (zipcode missing)').to.equal(true);
    });

    it('should enrich rows with the matched building attributes', () => {
        expect(+outCsvRows[0]['canton']).to.equal(GEO_ATTRS.canton);
        expect(+outCsvRows[0]['noiseexposure']).to.equal(GEO_ATTRS.noise_exposure);
        expect(+outCsvRows[0]['distancetohighvoltagepowerlines'])
            .to.equal(GEO_ATTRS.distance_to_highvoltage_powerlines);
        // unmatched columns stay enriched even for the EGID-only row
        expect(+outCsvRows[3]['canton']).to.equal(GEO_ATTRS.canton);
    });

    it('should categorize yearofconstruction, keeping the bank value (not the GWR year)', () => {
        // bank value 2000 -> default category 5 (1991-2005); GWR has 1998
        expect(outCsvRows[0]['yearofconstruction']).to.equal('5');
    });

    it('should tally the match summary and per-row log entries', () => {
        const byId = new Map(result.MatchSummary.map((m) => [m.Id, m.Count]));
        expect(byId.get(MatchingTypeEnum.EGIDPointMatchingIdentical)).to.equal(1);
        expect(byId.get(MatchingTypeEnum.PointMatching)).to.equal(2);
        expect(byId.get(MatchingTypeEnum.EGIDMatchingNoMatching)).to.equal(1);
        expect(byId.get(MatchingTypeEnum.EGIDPointMatchingDifferent)).to.equal(1);
        expect(result.Rows).to.have.length(5);
        expect(result.Violations.map((v) => v.Id).sort((a, b) => a - b)).to.deep.equal([11, 51, 52]);
    });
});
