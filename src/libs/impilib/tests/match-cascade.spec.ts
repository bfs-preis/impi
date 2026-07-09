import { expect } from 'chai';
import 'mocha';
import { match, MatchingTypeEnum, MatchResult } from '../src/match/match.js';
import { IBankDataCsv } from '../src/types/IBankDataCsv.js';
import { IBuildingRecord } from '../src/types/IBuildingRecord.js';
import { GeoDatabase } from '../src/match/GeoDatabase.js';

// Minimal building record for testing
function makeBuilding(overrides: Partial<IBuildingRecord> = {}): IBuildingRecord {
    return {
        egid: 1001, street: 'teststr', street_number: '1', zip_code: 3000,
        community: 'bern', designation_of_building: '',
        canton: 1, major_statistical_region: 1, community_type: 1,
        second_appartement_quota: 1, tax_burden: 1, travel_time_to_centers: 1,
        public_transport_quality: 1, noise_exposure: 1, slope: 1, exposure: 1,
        lake_view: 1, mountain_view: 1, distance_to_lakes: 1,
        distance_to_rivers: 1, distance_to_highvoltage_powerlines: 1,
        year_of_construction: 2000,
        ...overrides
    } as IBuildingRecord;
}

function makeInput(overrides: Partial<IBankDataCsv> = {}): IBankDataCsv {
    return {
        transactiondate: '01.01.2025', price: '500000', street: 'Teststrasse',
        streetnumber: '1', zipcode: '3000', community: 'Bern',
        objecttype: '1', singlefamilyhousetype: '1', condominiumtype: '',
        primaryorsecondaryhome: '1', owneroccupiedorrented: '1',
        yearofconstruction: '2000', landarea: '200', volumeofbuilding: '800',
        standardofvolume: '2', netlivingarea: '', numberofrooms: '4',
        numberofbathrooms: '1', numberofparkings: '1', constructionquality: '2',
        propertycondition: '2', egid: '',
        ...overrides
    };
}

/**
 * Creates a mock GeoDatabase-like object.
 * Only the methods called by match.ts need to be implemented.
 */
function createMockGeoDatabase(config: {
    addressRows?: IBuildingRecord[] | null;
    addressMappingRows?: IBuildingRecord[] | null;
    designationRow?: IBuildingRecord | null;
    centerStreetRow?: IBuildingRecord | null;
    centerStreetMappingRow?: IBuildingRecord | null;
    centerCommunityRow?: IBuildingRecord | null;
    centerCommunityMappingRow?: IBuildingRecord | null;
    egidRow?: IBuildingRecord | null;
} = {}): GeoDatabase {
    return {
        searchAddress(_street: string, _zip: number, cb: (err: Error | null, rows: IBuildingRecord[] | null) => void) {
            cb(null, config.addressRows ?? null);
        },
        searchAddressWithMappings(_street: string, _zip: number, cb: (err: Error | null, rows: IBuildingRecord[] | null) => void) {
            cb(null, config.addressMappingRows ?? null);
        },
        searchDesignationOfBuilding(_street: string, _zip: number, _comm: string | null, cb: (err: Error | null, row: IBuildingRecord | null) => void) {
            cb(null, config.designationRow ?? null);
        },
        searchCenterStreet(_street: string, _zip: number, _comm: string | null, cb: (err: Error | null, row: IBuildingRecord | null) => void) {
            cb(null, config.centerStreetRow ?? null);
        },
        searchCenterStreetWithMappings(_street: string, _zip: number, _comm: string | null, cb: (err: Error | null, row: IBuildingRecord | null) => void) {
            cb(null, config.centerStreetMappingRow ?? null);
        },
        searchCenterCommunities(_zip: number, _comm: string | null, cb: (err: Error | null, row: IBuildingRecord | null) => void) {
            cb(null, config.centerCommunityRow ?? null);
        },
        searchCenterCommunitiesWithMappings(_zip: number, _comm: string | null, cb: (err: Error | null, row: IBuildingRecord | null) => void) {
            cb(null, config.centerCommunityMappingRow ?? null);
        },
        searchByEGID(_egid: number, cb: (err: Error | null, row: IBuildingRecord | null) => void) {
            cb(null, config.egidRow ?? null);
        },
    } as unknown as GeoDatabase;
}

function runMatch(input: IBankDataCsv, db: GeoDatabase): Promise<{ result: MatchResult; err: Error | null }> {
    return new Promise((resolve) => {
        match(input, db, (result, err) => resolve({ result, err }));
    });
}

describe('Match cascade (address only)', () => {

    it('should return NoMatching when zipcode is missing', async () => {
        const db = createMockGeoDatabase();
        const { result } = await runMatch(makeInput({ zipcode: '' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.NoMatching);
        expect(result.record).to.be.null;
    });

    it('should return NoMatching when zipcode is invalid', async () => {
        const db = createMockGeoDatabase();
        const { result } = await runMatch(makeInput({ zipcode: 'abc' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.NoMatching);
    });

    it('should return CenterCommunitiesMatching when only zipcode (no street)', async () => {
        const building = makeBuilding();
        const db = createMockGeoDatabase({ centerCommunityRow: building });
        const { result } = await runMatch(makeInput({ street: '', streetnumber: '' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.CenterCommunitiesMatching);
        expect(result.record).to.equal(building);
    });

    it('should return NoMatching when only zipcode and no community match', async () => {
        const db = createMockGeoDatabase();
        const { result } = await runMatch(makeInput({ street: '' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.NoMatching);
    });

    it('should return PointMatching when address matches exactly', async () => {
        const building = makeBuilding({ street: 'teststr', street_number: '1' });
        const db = createMockGeoDatabase({ addressRows: [building] });
        const { result } = await runMatch(makeInput(), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.PointMatching);
        expect(result.record).to.equal(building);
    });

    it('should fall through to center street when address misses', async () => {
        const centerBuilding = makeBuilding({ egid: 2002 });
        const db = createMockGeoDatabase({ centerStreetRow: centerBuilding });
        const { result } = await runMatch(makeInput(), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.CenterStreetMatching);
        expect(result.record?.egid).to.equal(2002);
    });

    it('should fall through to center communities when all others miss', async () => {
        const centerBuilding = makeBuilding({ egid: 3003 });
        const db = createMockGeoDatabase({ centerCommunityRow: centerBuilding });
        const { result } = await runMatch(makeInput(), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.CenterCommunitiesMatching);
    });

    it('should return NoMatching when everything misses', async () => {
        const db = createMockGeoDatabase();
        const { result } = await runMatch(makeInput(), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.NoMatching);
        expect(result.record).to.be.null;
    });
});

describe('Match with EGID (parallel)', () => {

    it('should use the plain address codes when no EGID in input', async () => {
        const addrBuilding = makeBuilding({ street: 'teststr', street_number: '1' });
        const db = createMockGeoDatabase({ addressRows: [addrBuilding] });
        const { result } = await runMatch(makeInput({ egid: '' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.PointMatching);
    });

    it('should return EGIDMatchingNoMatching when only the EGID matches', async () => {
        const egidBuilding = makeBuilding({ egid: 5005 });
        const db = createMockGeoDatabase({ egidRow: egidBuilding });
        const { result } = await runMatch(makeInput({ egid: '5005' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.EGIDMatchingNoMatching);
        expect(result.record?.egid).to.equal(5005);
    });

    it('should fall back to address when EGID not found', async () => {
        const addrBuilding = makeBuilding({ street: 'teststr', street_number: '1' });
        const db = createMockGeoDatabase({ egidRow: null, addressRows: [addrBuilding] });
        const { result } = await runMatch(makeInput({ egid: '9999' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.PointMatching);
    });

    it('should return EGIDPointMatchingIdentical when EGID and point matching agree', async () => {
        const egidBuilding = makeBuilding({ egid: 5005, canton: 99 });
        const addrBuilding = makeBuilding({ egid: 5005, canton: 99, street: 'teststr', street_number: '1' });
        const db = createMockGeoDatabase({ egidRow: egidBuilding, addressRows: [addrBuilding] });
        const { result } = await runMatch(makeInput({ egid: '5005' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.EGIDPointMatchingIdentical);
        expect(result.record?.egid).to.equal(5005);
    });

    it('should prefer point matching when EGID and point matching disagree', async () => {
        const egidBuilding = makeBuilding({ egid: 5005, canton: 99 });
        const addrBuilding = makeBuilding({ egid: 6006, canton: 1, street: 'teststr', street_number: '1' });
        const db = createMockGeoDatabase({ egidRow: egidBuilding, addressRows: [addrBuilding] });
        const { result } = await runMatch(makeInput({ egid: '5005' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.EGIDPointMatchingDifferent);
        expect(result.record?.canton).to.equal(1); // point-matched building used
        expect(result.record?.egid).to.equal(6006);
    });

    it('should return EGIDMatchingCenterStreet when EGID matches and address only center-street-matches', async () => {
        const egidBuilding = makeBuilding({ egid: 5005, canton: 99 });
        const centerBuilding = makeBuilding({ egid: 2002, canton: 1 });
        const db = createMockGeoDatabase({ egidRow: egidBuilding, centerStreetRow: centerBuilding });
        const { result } = await runMatch(makeInput({ egid: '5005' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.EGIDMatchingCenterStreet);
        expect(result.record?.egid).to.equal(5005); // EGID building used
    });

    it('should return EGIDMatchingCenterCommunities when EGID matches and address only center-plz-matches', async () => {
        const egidBuilding = makeBuilding({ egid: 5005 });
        const centerBuilding = makeBuilding({ egid: 3003 });
        const db = createMockGeoDatabase({ egidRow: egidBuilding, centerCommunityRow: centerBuilding });
        const { result } = await runMatch(makeInput({ egid: '5005' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.EGIDMatchingCenterCommunities);
        expect(result.record?.egid).to.equal(5005); // EGID building used
    });

    it('should ignore non-numeric EGID', async () => {
        const db = createMockGeoDatabase();
        const { result } = await runMatch(makeInput({ egid: 'abc' }), db);
        expect(result.matchingType).to.equal(MatchingTypeEnum.NoMatching);
    });
});
