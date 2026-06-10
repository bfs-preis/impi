import { normalizeStreet, normalizeStreetNumber } from './normalizeStreet.js';
import { expect } from 'chai';
import 'mocha';

describe('normalizeStreet edge cases', () => {

    it('should throw on non-string input', () => {
        expect(() => normalizeStreet(123 as unknown as string)).to.throw('must be a string');
    });

    it('should handle all-caps input', () => {
        const result = normalizeStreet('BAHNHOFSTRASSE');
        expect(result).to.equal('bahnhofstr');
    });

    it('should handle numbers in street name', () => {
        const result = normalizeStreet('Strasse 1');
        expect(result).to.equal('str1');
    });

    it('should handle very long input', () => {
        const longName = 'A'.repeat(500) + 'strasse';
        const result = normalizeStreet(longName);
        expect(result).to.be.a('string');
        expect(result.length).to.be.greaterThan(0);
    });

    it('should handle string with only spaces', () => {
        const result = normalizeStreet('   ');
        expect(result).to.equal('');
    });

    it('should handle multiple consecutive hyphens', () => {
        const result = normalizeStreet('Test--Strasse');
        expect(result).to.be.a('string');
    });

    it('should handle all Swiss umlauts', () => {
        const result = normalizeStreet('Ärgerüberösig');
        expect(result).to.equal('aergerueberoesig');
    });

    it('should handle parentheses correctly', () => {
        const result = normalizeStreet('Hauptstrasse (alt)');
        expect(result).to.equal('hauptstr');
    });

    it('should handle slash correctly', () => {
        const result = normalizeStreet('Haupt/Nebenstrasse');
        expect(result).to.equal('haupt');
    });
});

describe('normalizeStreetNumber edge cases', () => {

    it('should throw on non-string input', () => {
        expect(() => normalizeStreetNumber(42 as unknown as string)).to.throw('must be a string');
    });

    it('should handle empty string', () => {
        const result = normalizeStreetNumber('');
        expect(result).to.equal('');
    });

    it('should handle letters only', () => {
        const result = normalizeStreetNumber('abc');
        expect(result).to.equal('abc');
    });

    it('should truncate at ampersand', () => {
        const result = normalizeStreetNumber('1a & 2b');
        expect(result).to.equal('1a');
    });

    it('should truncate at plus', () => {
        const result = normalizeStreetNumber('1a + 2b');
        expect(result).to.equal('1a');
    });

    it('should truncate at backslash', () => {
        const result = normalizeStreetNumber('1a\\2b');
        expect(result).to.equal('1a');
    });
});
