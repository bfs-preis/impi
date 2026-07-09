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
    NoMatchingWithError = 4,
    EGIDPointMatchingIdentical = 5,
    EGIDPointMatchingDifferent = 6,
    EGIDMatchingCenterStreet = 7,
    EGIDMatchingCenterCommunities = 8,
    EGIDMatchingNoMatching = 9,
    EGIDMatchingNoMatchingWithError = 10
}

export interface MatchResult {
    record: IBuildingRecord | null;
    matchingType: MatchingTypeEnum;
}

export function match(
    record: IBankDataCsv,
    geoDatabase: GeoDatabase,
    callback: (result: MatchResult, err: Error | null) => void): void {

    _matchAsync(record, geoDatabase)
        .then(([result, err]) => callback(result, err))
        .catch((error) => callback({
            record: null,
            matchingType: MatchingTypeEnum.NoMatchingWithError
        }, error));
}

async function _matchAsync(
    record: IBankDataCsv,
    geoDatabase: GeoDatabase
): Promise<[MatchResult, Error | null]> {

    const hasEgid = !!record.egid?.length && !isNaN(+record.egid);

    // Run EGID lookup and address cascade in parallel.
    // A failing EGID lookup counts as "no EGID match"; a failing address
    // cascade is only fatal when the EGID didn't match either (code 10 vs 4).
    const [egidRow, [addressRow, addressType, addressError]] = await Promise.all([
        hasEgid ? _searchEGID(geoDatabase, +record.egid).catch(() => null) : Promise.resolve(null),
        _addressCascade(record, geoDatabase)
            .then((r): [IBuildingRecord | null, MatchingTypeEnum, Error | null] => [r[0], r[1], null])
            .catch((err: Error): [IBuildingRecord | null, MatchingTypeEnum, Error | null] =>
                [null, MatchingTypeEnum.NoMatchingWithError, err])
    ]);

    // No EGID match: the address cascade result stands as-is (codes 0-4)
    if (egidRow === null) {
        return [{ record: addressRow, matchingType: addressType }, addressError];
    }

    // EGID matched: combine with the address cascade outcome (codes 5-10)
    switch (addressType) {
        case MatchingTypeEnum.PointMatching:
            // Identical building: either result works, take the EGID row.
            // Different buildings: the address is less prone to false
            // positives (typos in an EGID silently hit another building),
            // so point matching wins.
            return addressRow!.egid === egidRow.egid
                ? [{ record: egidRow, matchingType: MatchingTypeEnum.EGIDPointMatchingIdentical }, null]
                : [{ record: addressRow, matchingType: MatchingTypeEnum.EGIDPointMatchingDifferent }, null];
        case MatchingTypeEnum.CenterStreetMatching:
            return [{ record: egidRow, matchingType: MatchingTypeEnum.EGIDMatchingCenterStreet }, null];
        case MatchingTypeEnum.CenterCommunitiesMatching:
            return [{ record: egidRow, matchingType: MatchingTypeEnum.EGIDMatchingCenterCommunities }, null];
        case MatchingTypeEnum.NoMatchingWithError:
            return [{ record: egidRow, matchingType: MatchingTypeEnum.EGIDMatchingNoMatchingWithError }, null];
        default:
            return [{ record: egidRow, matchingType: MatchingTypeEnum.EGIDMatchingNoMatching }, null];
    }
}

async function _addressCascade(
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

function _searchEGID(geoDatabase: GeoDatabase, egid: number): Promise<IBuildingRecord | null> {
    return new Promise((resolve, reject) => {
        geoDatabase.searchByEGID(egid, (err: Error | null, row: IBuildingRecord | null) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
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
