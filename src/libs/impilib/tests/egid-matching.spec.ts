import { expect } from 'chai';
import 'mocha';
import { MatchingTypeEnum, MatchResult } from '../src/match/match.js';
import { IBankDataCsv } from '../src/types/IBankDataCsv.js';
import { ValidationRules } from '../src/validation/ValidationRules.js';

describe('EGID Matching Types', () => {

    it('should have EGIDMatching enum value', () => {
        expect(MatchingTypeEnum.EGIDMatching).to.equal(5);
    });

    it('should have all original matching types unchanged', () => {
        expect(MatchingTypeEnum.PointMatching).to.equal(0);
        expect(MatchingTypeEnum.CenterStreetMatching).to.equal(1);
        expect(MatchingTypeEnum.CenterCommunitiesMatching).to.equal(2);
        expect(MatchingTypeEnum.NoMatching).to.equal(3);
        expect(MatchingTypeEnum.NoMatchingWithError).to.equal(4);
    });
});

describe('MatchResult interface', () => {

    it('should represent an EGID match result', () => {
        const result: MatchResult = {
            record: null,
            matchingType: MatchingTypeEnum.EGIDMatching,
            egidProvided: true,
            egidMatched: true,
            addressMatched: false
        };
        expect(result.egidProvided).to.equal(true);
        expect(result.egidMatched).to.equal(true);
        expect(result.addressMatched).to.equal(false);
        expect(result.matchingType).to.equal(MatchingTypeEnum.EGIDMatching);
    });

    it('should represent a fallback to address match', () => {
        const result: MatchResult = {
            record: null,
            matchingType: MatchingTypeEnum.PointMatching,
            egidProvided: true,
            egidMatched: false,
            addressMatched: true
        };
        expect(result.egidProvided).to.equal(true);
        expect(result.egidMatched).to.equal(false);
        expect(result.addressMatched).to.equal(true);
    });

    it('should represent no EGID provided', () => {
        const result: MatchResult = {
            record: null,
            matchingType: MatchingTypeEnum.NoMatching,
            egidProvided: false,
            egidMatched: false,
            addressMatched: false
        };
        expect(result.egidProvided).to.equal(false);
    });
});

describe('EGID Validation Rule (ID 51)', () => {

    const egidRule = ValidationRules.find(r => r.Id === 51);

    it('should exist', () => {
        expect(egidRule).to.not.be.undefined;
    });

    it('should pass when egid is empty (optional field)', () => {
        const row = { egid: '' } as IBankDataCsv;
        expect(egidRule!.ValCode(row)).to.equal(true);
    });

    it('should pass when egid is a valid number', () => {
        const row = { egid: '123456' } as IBankDataCsv;
        expect(egidRule!.ValCode(row)).to.equal(true);
    });

    it('should fail when egid is non-numeric', () => {
        const row = { egid: 'abc123' } as IBankDataCsv;
        expect(egidRule!.ValCode(row)).to.equal(false);
    });

    it('should not be a red flag', () => {
        expect(egidRule!.RedFlag).to.equal(false);
    });
});
