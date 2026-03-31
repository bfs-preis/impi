import { normalizeCity } from './normalizeCity.js';
import { expect } from 'chai';
import 'mocha';

describe('normalizeCity edge cases', () => {

    it('should throw on non-string input', () => {
        expect(() => normalizeCity(123 as unknown as string)).to.throw('must be a string');
    });

    it('should handle all-caps input', () => {
        const result = normalizeCity('ZÜRICH');
        expect(result).to.equal('zuerich');
    });

    it('should handle string with only spaces', () => {
        const result = normalizeCity('   ');
        expect(result).to.equal('');
    });

    it('should handle very long input', () => {
        const longName = 'A'.repeat(500);
        const result = normalizeCity(longName);
        expect(result).to.be.a('string');
        expect(result.length).to.be.greaterThan(0);
    });

    it('should handle numbers in city name', () => {
        const result = normalizeCity('Basel 2');
        expect(result).to.equal('basel2');
    });

    it('should handle parentheses correctly', () => {
        const result = normalizeCity('Bern (BE)');
        expect(result).to.equal('bern');
    });

    it('should handle multiple French separators', () => {
        const result = normalizeCity('Val de la Roche');
        expect(result).to.equal('valroche');
    });

    it('should truncate at sur', () => {
        const result = normalizeCity('Vevey sur Montreux');
        expect(result).to.equal('vevey');
    });

    it('should handle all umlauts', () => {
        const result = normalizeCity('Münsingen-Überstorf');
        expect(result).to.equal('muensingenueberstorf');
    });
});
