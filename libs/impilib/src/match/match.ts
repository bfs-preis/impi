import { GeoDatabase } from "./GeoDatabase";
import { IBankDataCsv } from '../types/IBankDataCsv';
import { IBuildingRecord } from '../types/IBuildingRecord';
import { normalizeStreet } from 'normalize-street';
import { normalizeCity } from 'normalize-city';

export enum MatchingTypeEnum {
    PointMatching = 0,
    CenterStreetMatching = 1,
    CenterCommunitiesMatching = 2,
    NoMatching = 3,
    NoMatchingWithError = 4
}

export function match(
    record: IBankDataCsv,
    geoDatabase: GeoDatabase,
    callback: (record: IBuildingRecord | null, err: Error | null, matchingType: MatchingTypeEnum) => void): void {

    //Validate
    let hasStreet: boolean = (record as IBankDataCsv).street == undefined || (record as IBankDataCsv).street.length == 0 ? false : true;
    let hasZipCode: boolean = (record as IBankDataCsv).zipcode == undefined || (record as IBankDataCsv).zipcode.length == 0 ? false : true;
    let hasCommunity: boolean = (record as IBankDataCsv).community == undefined || (record as IBankDataCsv).community.length == 0 ? false : true;
    // tslint:disable-next-line:max-line-length
    let hasStreetNumber: boolean = (record as IBankDataCsv).streetnumber == undefined || (record as IBankDataCsv).streetnumber.length == 0 ? false : true;

    let zipcode = +record.zipcode;

    if (isNaN(zipcode) || zipcode === 0) {
        hasZipCode = false;
    }

    if (!hasZipCode) {
        return callback(null, null, MatchingTypeEnum.NoMatching);
    }

    let nCommunity = hasCommunity ? normalizeCity((record as IBankDataCsv).community) : null;

    //only zipcode no street
    if (!hasStreet) {

        _searchCenterCommunities(geoDatabase, zipcode, nCommunity)
            .then((row) => {
                if (row)
                    return callback(row, null, MatchingTypeEnum.CenterCommunitiesMatching);
                else
                    return callback(null, null, MatchingTypeEnum.NoMatching);
            })
            .catch((error) => {
                return callback(null, error, MatchingTypeEnum.NoMatchingWithError);
            });
        return;
    }

    // we have zip_code && street
    let nStreet = normalizeStreet((record as IBankDataCsv).street);
    let nStreetnumber= hasStreetNumber? record.streetnumber.toLowerCase().replace(/ /g,""):"";
    _searchAddress(geoDatabase, nStreet, nStreetnumber, zipcode, nCommunity)
        .then((row) => {
            if (row) {
                return callback(row, null, MatchingTypeEnum.PointMatching);
            }
            else {
                _searchCenterStreet(geoDatabase, nStreet, zipcode, nCommunity)
                    .then((center_row) => {
                        if (center_row) {
                            return callback(center_row, null, MatchingTypeEnum.CenterStreetMatching);
                        } else {
                            _searchCenterCommunities(geoDatabase, zipcode, nCommunity)
                                .then((row) => {
                                    if (row)
                                        return callback(row, null, MatchingTypeEnum.CenterCommunitiesMatching);
                                    else
                                        return callback(null, null, MatchingTypeEnum.NoMatching);
                                })
                                .catch((error) => {
                                    return callback(null, error, MatchingTypeEnum.NoMatchingWithError);
                                });
                        }
                    })
                    .catch((error) => {
                        return callback(null, error, MatchingTypeEnum.NoMatchingWithError);
                    });
            }
        })
        .catch((error) => {
            return callback(null, error, MatchingTypeEnum.NoMatchingWithError);
        });
}

function _searchAddress(geoDatabase: GeoDatabase, street: string, streetnumber: string, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchAddress(street, zipcode, (err: Error | null, rows: IBuildingRecord[] | null) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows) {
               
                let foundStreetNumber = rows.filter(r => r.street_number === streetnumber);
                if (foundStreetNumber && foundStreetNumber.length === 1) {
                    resolve(foundStreetNumber[0]);
                    return;
                } else if (foundStreetNumber && foundStreetNumber.length > 1) { //Search with Community
                    if (communitiy) {
                        let found = foundStreetNumber.find(r => r.community === communitiy);
                        if (found) {
                            resolve(found);
                            return;
                        }
                    }
                }
                //Not found try with Mappings
                geoDatabase.searchAddressWithMappings(street, zipcode, (err: Error | null, rows: IBuildingRecord[] | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (rows) {
                       
                        let foundStreetNumber = rows.filter(r => r.street_number === streetnumber);
                        if (foundStreetNumber && foundStreetNumber.length === 1) {
                            resolve(foundStreetNumber[0]);
                            return;
                        } else if (foundStreetNumber && foundStreetNumber.length > 1) { //Search with Community
                            if (communitiy) {
                                let found = foundStreetNumber.find(r => r.community === communitiy);
                                if (found) {
                                    resolve(found);
                                    return;
                                }
                            }
                        }
                        resolve(null);
                        return;
                    }
                    resolve(null);
                    return;
                });
            }
            resolve(null);
            return;
        });
    });
}

function _searchCenterCommunities(geoDatabase: GeoDatabase, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchCenterCommunities(zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
            if (err) {
                reject(err);
            }
            if (row) {
                resolve(row);
                return;
            }
            resolve(null);
        });
    });
}

function _searchCenterStreet(geoDatabase: GeoDatabase, street: string, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchCenterStreet(street, zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
            if (err) {
                reject(err);
            }
            if (row) {
                resolve(row);
                return;
            }
            resolve(null);
        });
    });
}

