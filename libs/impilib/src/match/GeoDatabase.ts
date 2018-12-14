import { verbose, Database } from 'sqlite3';
import { IBuildingRecord } from '../types/IBuildingRecord';
import * as moment from 'moment';

export interface IDbInfo {
    File: string;
    PeriodFrom: Date;
    PeriodTo: Date;
    Version: string;
}

export class GeoDatabase {
    private _db: any;
    private _file: string;

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
        this._db.get("SELECT * FROM VERSION", [], (err: Error, row: any) => {
            if (err) {
                return callback(null, err);
            } else {
                return callback({
                    File: this._file,
                    PeriodFrom: moment(row.period_from, 'D.M.YYYY', true).toDate(),
                    PeriodTo: moment(row.period_to, 'D.M.YYYY', true).toDate(),
                    Version: row.version
                } as IDbInfo, null);
            }
        });
    }

    kFactorCheck(callback: (check: boolean | null, err: Error | null) => void): void {
        let sqlQuery = `SELECT 
                    (SELECT COUNT(CAT_BAU) FROM (
                    SELECT  CAT_BAU ,COUNT(CAT_BAU)
                    FROM ( SELECT  (year_of_construction || ' ' || canton || ' ' ||major_statistical_region||' '||
                    second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                    ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                    ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                    ||distance_to_highvoltage_powerlines) AS CAT_BAU
                    FROM BUILDINGS WHERE year_of_construction !="")
                    GROUP BY CAT_BAU
                    HAVING (COUNT(CAT_BAU) < 3))) a,
                    
                    (SELECT COUNT(CAT_LAGE) FROM (
                    SELECT  CAT_LAGE ,COUNT(CAT_LAGE)
                    FROM ( SELECT  (canton || ' ' ||major_statistical_region||' '||
                    second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                    ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                    ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                    ||distance_to_highvoltage_powerlines) AS CAT_LAGE
                    FROM BUILDINGS WHERE year_of_construction ="" OR (year_of_construction || ' ' || canton || ' ' ||major_statistical_region||' '||
                    second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                    ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                    ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                    ||distance_to_highvoltage_powerlines IN (SELECT  CAT_BAU 
                        FROM ( SELECT  (year_of_construction || ' ' || canton || ' ' ||major_statistical_region||' '||
                        second_appartement_quota||' '||community_type||' '||tax_burden||' '||travel_time_to_centers||
                        ' '||public_transport_quality||' '||noise_exposure||' '||slope||' '||exposure||' '
                        ||lake_view||' '||mountain_view||' '||distance_to_lakes||' '||distance_to_rivers||' '
                        ||distance_to_highvoltage_powerlines) AS CAT_BAU
                        FROM BUILDINGS WHERE year_of_construction !="")
                        GROUP BY CAT_BAU
                        HAVING (COUNT(CAT_BAU) > 2)))  )
                    GROUP BY CAT_LAGE
                    HAVING (COUNT(CAT_LAGE) < 3))) b;`;

        this._db.get(sqlQuery, [], (err: Error, row: any) => {
            if (err) {
                return callback(null, err);
            } else {
                return callback(((row.a + row.b) === 0), null);
            }
        });
    }



    searchAddress(street: string, zipCode: number, callback: (err: Error | null, rows: IBuildingRecord[] | null) => void) {
        this._db.all("SELECT DISTINCT * FROM BUILDINGS WHERE STREET=@street AND ZIP_CODE=@zipcode", [street, zipCode], (err: Error, rows: any) => {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    }

    searchAddressWithMappings(street: string, zipCode: number, callback: (err: Error | null, rows: IBuildingRecord[] | null) => void) {
        this._db.all("SELECT DISTINCT * FROM BUILDINGS WHERE STREET=@street AND ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORIGINAL= @zipcode )", [street, zipCode], (err: Error, rows: any) => {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    }

    searchCenterStreet(street: string, zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERSTREETS WHERE ZIP_CODE=@zipcode AND STREET=@street", [zipCode, street], (err: Error, rows: any[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (let row of rows) {
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
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERSTREETS WHERE STREET=@street AND ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORIGINAL= @zipcode )", [street, zipCode], (err: Error, rows: any[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (let row of rows) {
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
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERCOMMUNITIES WHERE ZIP_CODE=@zipcode", [zipCode], (err: Error, rows: any[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (let row of rows) {
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
        this._db.all("SELECT EGID,COMMUNITY FROM CENTERCOMMUNITIES WHERE ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORIGINAL= @zipcode )", [zipCode], (err: Error, rows: any[]) => {
            if (err) {
                return callback(err, null);
            } else if (rows && rows.length > 0) {
                if (rows.length > 1) {
                    if (community) {
                        for (let row of rows) {
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
        this._db.get("SELECT * FROM BUILDINGS WHERE EGID=@egid", [egid], (err: Error, row: any) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, row);
            }
        });
    }




}