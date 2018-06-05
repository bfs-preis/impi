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
        this._db.all("SELECT DISTINCT * FROM BUILDINGS WHERE STREET=@street AND ZIP_CODE IN ( SELECT ALTERNATIV FROM ADDITIONALCOMMUNITIES WHERE ORGINAL= @zipcode )", [street, zipCode], (err: Error, rows: any) => {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    }

    searchCenterStreet(street: string, zipCode: number, community: string | null, callback: (err: Error | null, row: IBuildingRecord | null) => void) {
        this._db.all("SELECT EGID FROM CENTERSTREETS WHERE ZIP_CODE=@zipcode", [zipCode], (err: Error, rows: any[]) => {
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
        this._db.all("SELECT EGID FROM CENTERCOMMUNITIES WHERE ZIP_CODE=@zipcode", [zipCode], (err: Error, rows: any[]) => {
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