const Database = require('better-sqlite3');
const parse = require('csv-parse');
const winston = require('winston');
import fs = require('fs');
import * as iconv from 'iconv-lite';
import { normalizeStreet } from "normalize-street";
import { normalizeCity } from "normalize-city";
import * as definitions from "./table-definitions";

function genericCreateTableAndInserts(db: any, def: definitions.ITableDefinition, csvFile: string | null,
    rowCallback: (rowCount: number) => void | null, finishCallback: (rowCount: number) => void | null, errorCallback: (err: Error) => void | null) {

    let rowCount = 0;

    db.prepare("DROP TABLE IF EXISTS " + def.TableName).run();
    db.prepare("CREATE TABLE " + def.TableName + " (" + def.Fields.map(c => { return c.Name + " " + c.Type; }).join(",") + ")").run();

    if (def.Indexes) {
        for (let uq of def.Indexes) {
            db.prepare("DROP INDEX IF EXISTS " + uq.Name).run();
            db.prepare("CREATE INDEX " + uq.Name + " ON " + def.TableName + " (" + uq.Fields.join(",") + ")").run();
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
    //let inputEncoded = iconv.decodeStream('win1251');

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
                let nCommunity = normalizeCity(record.community);
                let i = def.Fields.map((t) => t.Name).indexOf("community");
                array[i] = nCommunity;
            }

            if (record.streetnumber != undefined) {
                let nStreetNumner = record.streetnumber.toLowerCase().replace(/ /g, "");
                let i = def.Fields.map((t) => t.Name).indexOf("street_number");
                array[i] = nStreetNumner;
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

export function checkDoubles(database: string): ({ Buildings: number, CenterStreets: number, CenterCommunities: number }) {
    let sqlBuildings = `SELECT street,street_number,zip_code,community
                        ,COUNT(street) count
                        FROM BUILDINGS
                        GROUP BY street,street_number,zip_code,community
                        HAVING (COUNT(street) > 1)`;
    let sqlCenterStreets = `SELECT street,zip_code,community
                            ,COUNT(street) count
                            FROM CENTERSTREETS
                            GROUP BY street,zip_code,community
                            HAVING (COUNT(street) > 1)`;
    let sqlCenterCommunities = `SELECT zip_code,community
                                ,COUNT(zip_code) count
                                FROM CENTERCOMMUNITIES
                                GROUP BY zip_code,community
                                HAVING (COUNT(zip_code) > 1)`;

    let buildingsCount = 0;
    let centerStreetsCount = 0;
    let centerCommunitiesCount = 0;

    let db = new Database(database);

    let rows = db.prepare(sqlBuildings).all();
    if (rows) {
        rows.forEach((element: any) => {
            winston.warn("Double Buildings:" + JSON.stringify(element));
            buildingsCount += element.count;
        });
    }

    rows = db.prepare(sqlCenterStreets).all();
    if (rows) {
        rows.forEach((element: any) => {
            winston.warn("Double CenterStreets:" + JSON.stringify(element));
            centerStreetsCount += element.count;
        });
    }

    rows = db.prepare(sqlCenterCommunities).all();
    if (rows) {
        rows.forEach((element: any) => {
            winston.warn("Double CenterCommunities:" + JSON.stringify(element));
            centerCommunitiesCount += element.count;
        });
    }

    return { Buildings: buildingsCount, CenterCommunities: centerCommunitiesCount, CenterStreets: centerStreetsCount };
}

export function checkKFactor(database: string): boolean {

    let sqlQuery = `SELECT 
                    (SELECT COUNT(CAT_BAU) FROM (
                    SELECT  CAT_BAU ,COUNT(CAT_BAU)
                    FROM ( SELECT  (year_of_construction || ' ' || canton || ' ' ||major_statistical_region||' '||
                    second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                    ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                    ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                    ||distance_to_highvoltage_powerlines) AS CAT_BAU
                    FROM BUILDINGS WHERE year_of_construction IS NULL)
                    GROUP BY CAT_BAU
                    HAVING (COUNT(CAT_BAU) < 3))) a,
                    
                    (SELECT COUNT(CAT_LAGE) FROM (
                    SELECT  CAT_LAGE ,COUNT(CAT_LAGE)
                    FROM ( SELECT  (canton || ' ' ||major_statistical_region||' '||
                    second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                    ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                    ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                    ||distance_to_highvoltage_powerlines) AS CAT_LAGE
                    FROM BUILDINGS )
                    GROUP BY CAT_LAGE
                    HAVING (COUNT(CAT_LAGE) < 3))) b`;

    let db = new Database(database);
    let row = db.prepare(sqlQuery).get();

    return ((row.a + row.b) == 0);

}

