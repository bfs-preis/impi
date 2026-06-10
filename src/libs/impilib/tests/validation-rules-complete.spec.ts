import { expect } from 'chai';
import 'mocha';
import { IBankDataCsv } from '../src/types/IBankDataCsv.js';
import { ValidationRules } from '../src/validation/ValidationRules.js';

function makeRow(overrides: Partial<IBankDataCsv> = {}): IBankDataCsv {
    return {
        transactiondate: '01.01.2025', price: '500000', street: 'Teststr', streetnumber: '1',
        zipcode: '3000', community: 'Bern', objecttype: '1', singlefamilyhousetype: '1',
        condominiumtype: '', primaryorsecondaryhome: '1', owneroccupiedorrented: '1',
        yearofconstruction: '2000', landarea: '200', volumeofbuilding: '800',
        standardofvolume: '2', netlivingarea: '', numberofrooms: '4', numberofbathrooms: '1',
        numberofparkings: '1', constructionquality: '2', propertycondition: '2', egid: '',
        ...overrides
    };
}

function getRule(id: number) {
    return ValidationRules.find(r => r.Id === id)!;
}

describe('Validation Rule 49: ObjectType=EFH and StandardOfVolume missing', () => {
    const rule = getRule(49);

    it('should pass when objecttype is not 1', () => {
        expect(rule.ValCode(makeRow({ objecttype: '2', standardofvolume: '' }))).to.equal(true);
    });

    it('should fail when objecttype=1 and standardofvolume is empty', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '' }))).to.equal(false);
    });

    it('should pass when objecttype=1 and standardofvolume is present', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '2' }))).to.equal(true);
    });
});

describe('Validation Rule 50: ObjectType=EFH and StandardOfVolume value', () => {
    const rule = getRule(50);

    it('should pass when objecttype is not 1', () => {
        expect(rule.ValCode(makeRow({ objecttype: '2' }))).to.equal(true);
    });

    it('should pass when standardofvolume is 1 (GVA)', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '1' }))).to.equal(true);
    });

    it('should pass when standardofvolume is 2 (SIA416)', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '2' }))).to.equal(true);
    });

    it('should pass when standardofvolume is 3 (SIA116)', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '3' }))).to.equal(true);
    });

    it('should fail when standardofvolume > 3', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '4' }))).to.equal(false);
    });

    it('should fail when standardofvolume < 1', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: '0' }))).to.equal(false);
    });

    it('should fail when standardofvolume is non-numeric', () => {
        expect(rule.ValCode(makeRow({ objecttype: '1', standardofvolume: 'abc' }))).to.equal(false);
    });
});

describe('Validation Rule 51: EGID Format', () => {
    const rule = getRule(51);

    it('should pass when egid is empty (optional)', () => {
        expect(rule.ValCode(makeRow({ egid: '' }))).to.equal(true);
    });

    it('should pass when egid is a valid number', () => {
        expect(rule.ValCode(makeRow({ egid: '123456' }))).to.equal(true);
    });

    it('should pass when egid is a large number', () => {
        expect(rule.ValCode(makeRow({ egid: '999999999' }))).to.equal(true);
    });

    it('should fail when egid contains letters', () => {
        expect(rule.ValCode(makeRow({ egid: 'abc' }))).to.equal(false);
    });

    it('should fail when egid is mixed alphanumeric', () => {
        expect(rule.ValCode(makeRow({ egid: '123abc' }))).to.equal(false);
    });

    it('should pass when egid has leading zeros', () => {
        expect(rule.ValCode(makeRow({ egid: '00123' }))).to.equal(true);
    });
});
