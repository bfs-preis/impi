import { GeoDatabase } from "./GeoDatabase.js";
import { IBankDataCsv } from '../types/IBankDataCsv.js';
import { IBuildingRecord } from '../types/IBuildingRecord.js';
import { normalizeStreet, normalizeStreetNumber } from 'normalize-street';
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

    _matchAsync(record, geoDatabase)
        .then(([row, matchingType]) => callback(row, null, matchingType))
        .catch((error) => callback(null, error, MatchingTypeEnum.NoMatchingWithError));
}

async function _matchAsync(
    record: IBankDataCsv,
    geoDatabase: GeoDatabase
): Promise<[IBuildingRecord | null, MatchingTypeEnum]> {

    const hasStreet = !!record.street?.length;
    let hasZipCode = !!record.zipcode?.length;
    const hasCommunity = !!record.community?.length;
    const hasStreetNumber = !!record.streetnumber?.length;

    const zipcode = +record.zipcode;

    if (isNaN(zipcode) || zipcode === 0) {
        hasZipCode = false;
    }

    if (!hasZipCode) {
        return [null, MatchingTypeEnum.NoMatching];
    }

    const nCommunity = hasCommunity ? normalizeCity(record.community) : null;

    // Only zipcode, no street
    if (!hasStreet) {
        const row = await _searchCenterCommunities(geoDatabase, zipcode, nCommunity);
        return row
            ? [row, MatchingTypeEnum.CenterCommunitiesMatching]
            : [null, MatchingTypeEnum.NoMatching];
    }

    // We have zip_code && street
    const nStreet = normalizeStreet(record.street);
    const nStreetnumber = hasStreetNumber ? normalizeStreetNumber(record.streetnumber) : "";

    // Try point matching via address
    const addressRow = await _searchAddress(geoDatabase, nStreet, nStreetnumber, zipcode, nCommunity);
    if (addressRow) {
        return [addressRow, MatchingTypeEnum.PointMatching];
    }

    // Try point matching via designation of building
    const designationRow = await _searchDesignationOfBuilding(geoDatabase, nStreet, zipcode, nCommunity);
    if (designationRow) {
        return [designationRow, MatchingTypeEnum.PointMatching];
    }

    // Try center street matching
    const centerStreetRow = await _searchCenterStreet(geoDatabase, nStreet, zipcode, nCommunity);
    if (centerStreetRow) {
        return [centerStreetRow, MatchingTypeEnum.CenterStreetMatching];
    }

    // Fall back to center communities matching
    const centerRow = await _searchCenterCommunities(geoDatabase, zipcode, nCommunity);
    return centerRow
        ? [centerRow, MatchingTypeEnum.CenterCommunitiesMatching]
        : [null, MatchingTypeEnum.NoMatching];
}

function _searchAddress(geoDatabase: GeoDatabase, street: string, streetnumber: string, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchAddress(street, zipcode, (err: Error | null, rows: IBuildingRecord[] | null) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows) {

                const foundStreetNumber = rows.filter(r => r.street_number === streetnumber);
                if (foundStreetNumber && foundStreetNumber.length === 1) {
                    resolve(foundStreetNumber[0]);
                    return;
                } else if (foundStreetNumber && foundStreetNumber.length > 1) { //Search with Community
                    if (communitiy) {
                        const found = foundStreetNumber.find(r => r.community === communitiy);
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

                        const foundStreetNumber = rows.filter(r => r.street_number === streetnumber);
                        if (foundStreetNumber && foundStreetNumber.length === 1) {

                            resolve(foundStreetNumber[0]);
                            return;
                        } else if (foundStreetNumber && foundStreetNumber.length > 1) { //Search with Community
                            if (communitiy) {
                                const found = foundStreetNumber.find(r => r.community === communitiy);
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
            } else {
                resolve(null);
                return;
            }
        });
    });
}

function _searchDesignationOfBuilding(geoDatabase: GeoDatabase, street: string, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchDesignationOfBuilding(street, zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
            if (err) {
                reject(err);
                return;
            }
            if (row) {
                resolve(row);
                return;
            } else {
                resolve(null);
            }
        });
    });
}

function _searchCenterCommunities(geoDatabase: GeoDatabase, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchCenterCommunities(zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
            if (err) {
                reject(err);
                return;
            }
            if (row) {
                resolve(row);
                return;
            } else {
                geoDatabase.searchCenterCommunitiesWithMappings(zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (row) {
                        resolve(row);
                        return;
                    }
                    else {
                        resolve(null);
                    }
                });
            }
        });
    });
}

function _searchCenterStreet(geoDatabase: GeoDatabase, street: string, zipcode: number, communitiy: string | null): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchCenterStreet(street, zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
            if (err) {
                reject(err);
                return;
            }
            if (row) {
                resolve(row);
                return;
            } else {
                geoDatabase.searchCenterStreetWithMappings(street, zipcode, communitiy, (err: Error | null, row: IBuildingRecord | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (row) {
                        resolve(row);
                        return;
                    }
                    else {
                        resolve(null);
                    }
                });
            }
        });
    });
}
