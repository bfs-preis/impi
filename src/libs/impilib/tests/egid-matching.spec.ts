import { expect } from 'chai';
import 'mocha';
import { MatchingTypeEnum } from '../src/match/match.js';
import { IBankDataCsv } from '../src/types/IBankDataCsv.js';
import { ValidationRules } from '../src/validation/ValidationRules.js';

describe('EGID Matching Types', () => {

    it('should have all original matching types unchanged', () => {
        expect(MatchingTypeEnum.PointMatching).to.equal(0);
        expect(MatchingTypeEnum.CenterStreetMatching).to.equal(1);
        expect(MatchingTypeEnum.CenterCommunitiesMatching).to.equal(2);
        expect(MatchingTypeEnum.NoMatching).to.equal(3);
        expect(MatchingTypeEnum.NoMatchingWithError).to.equal(4);
    });

    it('should have the combined EGID/address matching types', () => {
        expect(MatchingTypeEnum.EGIDPointMatchingIdentical).to.equal(5);
        expect(MatchingTypeEnum.EGIDPointMatchingDifferent).to.equal(6);
        expect(MatchingTypeEnum.EGIDMatchingCenterStreet).to.equal(7);
        expect(MatchingTypeEnum.EGIDMatchingCenterCommunities).to.equal(8);
        expect(MatchingTypeEnum.EGIDMatchingNoMatching).to.equal(9);
        expect(MatchingTypeEnum.EGIDMatchingNoMatchingWithError).to.equal(10);
    });
});

describe('EGID Validation Rule 51 (EGID is missing)', () => {

    const rule = ValidationRules.find(r => r.Id === 51);

    it('should exist', () => {
        expect(rule).to.not.be.undefined;
        expect(rule!.Message).to.equal('EGID is missing');
    });

    it('should fail when egid is empty', () => {
        const row = { egid: '' } as IBankDataCsv;
        expect(rule!.ValCode(row)).to.equal(false);
    });

    it('should fail when egid is undefined', () => {
        const row = {} as IBankDataCsv;
        expect(rule!.ValCode(row)).to.equal(false);
    });

    it('should pass when egid is present', () => {
        const row = { egid: '123456' } as IBankDataCsv;
        expect(rule!.ValCode(row)).to.equal(true);
    });

    it('should not be a red flag', () => {
        expect(rule!.RedFlag).to.equal(false);
    });
});

describe('EGID Validation Rule 52 (EGID Format ≠ Number)', () => {

    const rule = ValidationRules.find(r => r.Id === 52);

    it('should exist', () => {
        expect(rule).to.not.be.undefined;
        expect(rule!.Message).to.equal('EGID Format ≠ Number');
    });

    it('should pass when egid is empty (missing is rule 51)', () => {
        const row = { egid: '' } as IBankDataCsv;
        expect(rule!.ValCode(row)).to.equal(true);
    });

    it('should pass when egid is a valid number', () => {
        const row = { egid: '123456' } as IBankDataCsv;
        expect(rule!.ValCode(row)).to.equal(true);
    });

    it('should fail when egid is non-numeric', () => {
        const row = { egid: 'abc123' } as IBankDataCsv;
        expect(rule!.ValCode(row)).to.equal(false);
    });

    it('should not be a red flag', () => {
        expect(rule!.RedFlag).to.equal(false);
    });
});
