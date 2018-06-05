const Database = require('better-sqlite3');
const parse = require('csv-parse');
const winston = require('winston');
import fs = require('fs');
import * as iconv from 'iconv-lite';
import { normalizeStreet } from "normalize-street";
import * as definitions from "./table-definitions";

function genericCreateTableAndInserts(db: any, def: definitions.ITableDefinition, csvFile: string | null,
    rowCallback: (rowCount: number) => void | null, finishCallback: (rowCount: number) => void | null, errorCallback: (err: Error) => void | null) {

    let rowCount = 0;

    db.prepare("DROP TABLE IF EXISTS " + def.TableName).run();
    db.prepare("CREATE TABLE " + def.TableName + " (" + def.Fields.map(c => { return c.Name + " " + c.Type; }).join(",") + ")").run();

    if (def.UniqueKeys) {
        for (let uq of def.UniqueKeys) {
            db.prepare("DROP INDEX IF EXISTS " + uq.Name).run();
            db.prepare("CREATE UNIQUE INDEX " + uq.Name + " ON " + def.TableName + " (" + uq.Fields.join(",") + ")").run();
        }
    }

    if (!csvFile) {
        if (rowCallback) rowCallback(0);
        if (finishCallback) finishCallback(0);
        return
    };

    db.prepare("BEGIN").run();
    let stmt = db.prepare("INSERT INTO " + def.TableName + " VALUES (" + def.Fields.map(c => { return "?"; }).join(",") + ")");

    let input = fs.createReadStream(csvFile, { encoding: 'binary' });
    // Create the parser
    let parser = parse({
        delimiter: ';',
        columns: (columns: string[]): string[] => {

            let noColumnsFound: string[] = [];
            let containsAll = (arr1: string[], arr2: string[]) =>
                arr2.every((arr2Item: string) => {
                    if (arr1.indexOf(arr2Item.toLowerCase()) >= 0)
                        return true;
                    else {
                        noColumnsFound.push(arr2Item.toLowerCase());
                        return false;
                    }

                });

            let array = def.Fields.map(c => {
                return c.Name.replace(/_/g, "").toLowerCase();
            });

            let columnsLower = columns.map((column) => {
                return column.toLowerCase();
            });

            if (!containsAll(array, columnsLower)) {
                winston.debug(def);
                throw new Error("Not all Columns:" + JSON.stringify(noColumnsFound));
            }

            return columnsLower;
        }
    });

    // Catch any error
    parser.on('error', function (err: Error) {
        if (errorCallback) return errorCallback(err);
    });


    parser.on('finish', function () {
        db.prepare("COMMIT").run();
        if (finishCallback) finishCallback(rowCount);
    });

    parser.on('readable', function () {
        let record: any;
        while (record = parser.read()) {
            if (stmt === null) throw "Statement null!";

            let array = def.Fields.map(c => {
                let dbFieldName = c.Name.replace(/_/g, "");
                return record[dbFieldName];
            });

            if (record.street != undefined) {
                let nStreet = normalizeStreet(record.street);
                let i = def.Fields.map((t) => t.Name).indexOf("street");
                array[i] = nStreet;
            }

            if (record.community != undefined) {
                let nCommunity = normalizeStreet(record.community);
                let i = def.Fields.map((t) => t.Name).indexOf("community");
                array[i] = nCommunity;
            }

            try {
                winston.log('silly', array);
                stmt.run(array);
                rowCount++;
                if (rowCallback) rowCallback(rowCount);
            }
            catch (err) {
                winston.log('verbose', def);
                winston.warn(err.message, JSON.stringify(record));
            }
        }
    });

    input.pipe(parser);
}

function createVersionTable(db: any, version: string, periodFrom: string, periodTo: string, finishCallback: (rowCount: number) => void, errorCallback: (err: Error) => void) {
    genericCreateTableAndInserts(db, definitions.VersionTable, null, () => { }, () => {
        db.prepare("INSERT INTO VERSION VALUES (?,?,?)").run([version, periodFrom, periodTo]);
        finishCallback(1);
    }, errorCallback);
}

function createCenterStreetsTable(db: any, csvFile: string | null, rowCallback: (rowCount: number) => void, finishCallback: (rowCount: number) => void, errorCallback: (err: Error) => void) {
    genericCreateTableAndInserts(db, definitions.CenterStreetsTable, csvFile, rowCallback, finishCallback, errorCallback);
}

function createCenterCommunitiesTable(db: any, csvFile: string | null, rowCallback: (rowCount: number) => void, finishCallback: (rowCount: number) => void, errorCallback: (err: Error) => void) {
    genericCreateTableAndInserts(db, definitions.CenterCommunitiesTable, csvFile, rowCallback, finishCallback, errorCallback);
}

function createBuildingsTable(db: any, csvFile: string | null, rowCallback: (rowCount: number) => void, finishCallback: (rowCount: number) => void, errorCallback: (err: Error) => void) {
    genericCreateTableAndInserts(db, definitions.BuildingsTable, csvFile, rowCallback, finishCallback, errorCallback);
}

function createAdditionalCommunities(db: any, csvFile: string | null, rowCallback: (rowCount: number) => void, finishCallback: (rowCount: number) => void, errorCallback: (err: Error) => void) {
    genericCreateTableAndInserts(db, definitions.AdditionalCommunitiesTable, csvFile, rowCallback, finishCallback, errorCallback);
}

export function generate(database: string, version: string, periodFrom: string, periodTo: string,
    csvStreet: string | null, csvCommunities: string | null, csvBuildings: string | null, additionalCommunitiesCsv: string | null, rowCallback: (task: string, rowCount: number) => void, finishCallback: (rowCount: number) => void, errorCallback: (err: Error) => void) {

    let errorHandling = function (err: Error) {
        db.close();
        return errorCallback(err);
    }

    let db = new Database(database);
    db.prepare("PRAGMA synchronous=OFF;").run();
    createVersionTable(db, version, periodFrom, periodTo, () => {
        createCenterStreetsTable(db, csvStreet, (count) => {
            rowCallback("CenterStreets", count);
        }, (count) => {
            createCenterCommunitiesTable(db, csvCommunities, (count) => {
                rowCallback("CenterCommunities", count);
            }, (count) => {
                createBuildingsTable(db, csvBuildings, (count) => {
                    rowCallback("Buildings", count);
                }, (count) => {
                    createAdditionalCommunities(db, additionalCommunitiesCsv, (count) => {
                        rowCallback("AdditionalCommunities", count);
                    }, (count) => {
                        finishCallback(count);
                        db.close();
                    }, errorHandling);
                }, errorHandling);
            }, errorHandling);
        }, errorHandling);
    }, errorHandling);
}

