import pkg from 'sqlite3';
const { verbose, Database } = pkg;
import type { Database as DatabaseType } from 'sqlite3';
import { IBuildingRecord } from '../types/IBuildingRecord.js';
import moment from 'moment';

export interface IDbInfo {
    File: string;
    PeriodFrom: Date;
    PeriodTo: Date;
    Version: string;
}

interface VersionRow {
    version: string;
    period_from: string;
    period_to: string;
}

interface KFactorRow {
    a: number;
    b: number;
}

interface CenterRow {
    egid: number;
    community: string;
}

export interface IYearGroup {
    max_year: number;
    code: number;
}

export type YearCategories = ReadonlyArray<[number, number]>;

export class GeoDatabase {
    private _db: DatabaseType;
    private _file: string;
    private _yearGroups: YearCategories | null = null;

    get yearGroups(): YearCategories | null {
        return this._yearGroups;
    }

    constructor(file: string, errorCallback: (err: Error) => void) {
        verbose();
        this._file = file;
        this._db = new Database(this._file, (err: Error | null) => {
            if (err) {
                errorCallback(err);
            }
        });
    }

    close() {
        this._db.close();
    }

    verifyDb(callback: (dbInfo: IDbInfo | null, err: Error | null) => void): void {
        this._db.get("SELECT * FROM VERSION", [], (err: Error, row: VersionRow) => {
            if (err) {
                return callback(null, err);
            } else {
                return callback({
                    File: this._file,
                    PeriodFrom: moment(row.period_from, ['D.M.YYYY', 'DD.MM.YYYY']).toDate(),
                    PeriodTo: moment(row.period_to, ['D.M.YYYY', 'DD.MM.YYYY']).toDate(),
                    Version: row.version
                } as IDbInfo, null);
            }
        });
    }

    loadYearGroups(callback: (groups: YearCategories | null, err: Error | null) => void): void {
        this._db.all("SELECT max_year, code FROM YEAR_GROUPS ORDER BY max_year ASC", [], (err: Error, rows: IYearGroup[]) => {
            if (err) {
                // Table doesn't exist (old DB) — return null to signal fallback
                this._yearGroups = null;
                return callback(null, null);
            }
            if (!rows || rows.length === 0) {
                this._yearGroups = null;
                return callback(null, null);
            }
            this._yearGroups = rows.map(r => [r.max_year, r.code] as [number, number]);
            return callback(this._yearGroups, null);
        });
    }

    kFactorCheckAsync(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.kFactorCheck((check, error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(<boolean>check);
            });
        });
    }

    private buildYearCaseExpr(): string {
        const DEFAULT_GROUPS: YearCategories = [[1918, 1], [1945, 2], [1970, 3], [1990, 4], [2005, 5], [2015, 6]];
        const groups = this._yearGroups ?? DEFAULT_GROUPS;
        if (groups.length === 0) return 'year_of_construction';
        let sql = "CASE WHEN year_of_construction = '' THEN ''";
        for (const [maxYear, code] of groups) {
            sql += ` WHEN CAST(year_of_construction AS INTEGER) <= ${maxYear} THEN '${code}'`;
        }
        sql += ` ELSE '${groups[groups.length - 1][1] + 1}' END`;
        return sql;
    }

    kFactorCheck(callback: (check: boolean | null, err: Error | null) => void): void {
        const yearExpr = this.buildYearCaseExpr();
        const locationAttrs = `canton || ' ' ||major_statistical_region||' '||
                    second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                    ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                    ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                    ||distance_to_highvoltage_powerlines`;

        const sqlQuery = `SELECT
                    (SELECT COUNT(CAT_BAU) FROM (
                    SELECT  CAT_BAU ,COUNT(CAT_BAU)
                    FROM ( SELECT  (${yearExpr} || ' ' || ${locationAttrs}) AS CAT_BAU
                    FROM BUILDINGS WHERE year_of_construction !="")
                    GROUP BY CAT_BAU
                    HAVING (COUNT(CAT_BAU) < 3))) a,

                    (SELECT COUNT(CAT_LAGE) FROM (
                    SELECT  CAT_LAGE ,COUNT(CAT_LAGE)
                    FROM ( SELECT  (${locationAttrs}) AS CAT_LAGE
                    FROM BUILDINGS WHERE year_of_construction ="" OR (${yearExpr} || ' ' || ${locationAttrs} IN (SELECT  CAT_BAU
                        FROM ( SELECT  (${yearExpr} || ' ' || ${locationAttrs}) AS CAT_BAU
                        FROM BUILDINGS WHERE year_of_construction !="")
                        GROUP BY CAT_BAU
                        HAVING (COUNT(CAT_BAU) > 2)))  )
                    GROUP BY CAT_LAGE
                    HAVING (COUNT(CAT_LAGE) < 3))) b;`;

        this._db.get(sqlQuery, [], (err: Error, row: KFactorRow) => {
            if (err) {
                return callback(null, err);
            } else {
                return callback(((row.a + row.b) === 0), null);
            }
        });
    }



    searchAddress(street: string, zipCode: number, callback: (err: Error | null, rows: IBuildingRecord[] | null) => void) {
        this._db.all("SELECT DISTINCT * FROM BUILDINGS WHERE STREET=@street AND ZIP_CODE=@zipcode", [street, zipCode], (err: Error, rows: IBuildingRecord[]) => {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    }

    searchAddressWithMappings(street: string, zipCode: number, callback: (err: Error | null, rows: IBuildingRecord[] | null) => void) {
        this._db.all("SELECT DISTINCT * FROM BUILDINGS WHERE STREET=@street AND ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORIGINAL= @zipcode )", [street, zipCode], (err: Error, rows: IBuildingRecord[]) => {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    }

    searchDesignationOfBuilding(street: string, zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT DISTINCT * FROM BUILDINGS WHERE DESIGNATION_OF_BUILDING=@street AND ZIP_CODE=@zipcode", [street, zipCode], (err: Error, rows: IBuildingRecord[]) => {
            if (err) {
                return callback(err, null);
            }
            else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (const row of rows) {
                            if (row.community === community) {
                                return callback(null, row);
                            }
                        }
                    }
                    return callback(null, null);
                } else {
                    return callback(null, rows[0]);
                }
            }
            else {
                return callback(null, null);
            }
        });
    }

    searchCenterStreet(street: string, zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERSTREETS WHERE ZIP_CODE=@zipcode AND STREET=@street", [zipCode, street], (err: Error, rows: CenterRow[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (const row of rows) {
                            if (row.community === community) {
                                this._searchEGID(row.egid, callback);
                                return;
                            }
                        }
                    }
                    return callback(null, null);
                } else {
                    this._searchEGID(rows[0].egid, callback);
                }
            } else {
                return callback(null, null);
            }
        });
    }

    searchCenterStreetWithMappings(street: string, zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERSTREETS WHERE STREET=@street AND ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORIGINAL= @zipcode )", [street, zipCode], (err: Error, rows: CenterRow[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (const row of rows) {
                            if (row.community === community) {
                                this._searchEGID(row.egid, callback);
                                return;
                            }
                        }
                    }
                    return callback(null, null);
                } else {
                    this._searchEGID(rows[0].egid, callback);
                }
            } else {
                return callback(null, null);
            }
        });
    }

    searchCenterCommunities(zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERCOMMUNITIES WHERE ZIP_CODE=@zipcode", [zipCode], (err: Error, rows: CenterRow[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (const row of rows) {
                            if (row.community === community) {
                                this._searchEGID(row.egid, callback);
                                return;
                            }
                        }
                    }
                    return callback(null, null);
                } else {
                    this._searchEGID(rows[0].egid, callback);
                }
            } else {
                return callback(null, null);
            }
        });
    }

    searchCenterCommunitiesWithMappings(zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERCOMMUNITIES WHERE ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORIGINAL= @zipcode )", [zipCode], (err: Error, rows: CenterRow[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (const row of rows) {
                            if (row.community === community) {
                                this._searchEGID(row.egid, callback);
                                return;
                            }
                        }
                    }
                    return callback(null, null);
                } else {
                    this._searchEGID(rows[0].egid, callback);
                }
            } else {
                return callback(null, null);
            }
        });
    }

    private _searchEGID(egid: number, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.get("SELECT * FROM BUILDINGS WHERE EGID=@egid", [egid], (err: Error, row: IBuildingRecord) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, row);
            }
        });
    }




}