import { expect } from 'chai';
import 'mocha';
import { CheckInputFileFormat } from '../src/core/process.js';

const ALL_COLUMNS = [
    'transactiondate', 'price', 'street', 'streetnumber', 'zipcode', 'community',
    'objecttype', 'singlefamilyhousetype', 'condominiumtype', 'primaryorsecondaryhome',
    'owneroccupiedorrented', 'yearofconstruction', 'landarea', 'volumeofbuilding',
    'standardofvolume', 'netlivingarea', 'numberofrooms', 'numberofbathrooms',
    'numberofparkings', 'constructionquality', 'propertycondition', 'egid'
];

describe('CheckInputFileFormat', () => {

    it('should return empty array when all columns present', () => {
        const header = ALL_COLUMNS.join(';');
        const missing = CheckInputFileFormat(header, ';');
        expect(missing).to.be.an('array').that.is.empty;
    });

    it('should detect a single missing column', () => {
        const columns = ALL_COLUMNS.filter(c => c !== 'price');
        const header = columns.join(';');
        const missing = CheckInputFileFormat(header, ';');
        expect(missing).to.deep.equal(['price']);
    });

    it('should detect multiple missing columns', () => {
        const columns = ALL_COLUMNS.filter(c => c !== 'price' && c !== 'street');
        const header = columns.join(';');
        const missing = CheckInputFileFormat(header, ';');
        expect(missing).to.include('price');
        expect(missing).to.include('street');
        expect(missing).to.have.lengthOf(2);
    });

    it('should be case insensitive', () => {
        const header = ALL_COLUMNS.map(c => c.toUpperCase()).join(';');
        const missing = CheckInputFileFormat(header, ';');
        expect(missing).to.be.an('array').that.is.empty;
    });

    it('should handle mixed case', () => {
        const header = ALL_COLUMNS.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(';');
        const missing = CheckInputFileFormat(header, ';');
        expect(missing).to.be.an('array').that.is.empty;
    });

    it('should work with comma delimiter', () => {
        const header = ALL_COLUMNS.join(',');
        const missing = CheckInputFileFormat(header, ',');
        expect(missing).to.be.an('array').that.is.empty;
    });

    it('should work with tab delimiter', () => {
        const header = ALL_COLUMNS.join('\t');
        const missing = CheckInputFileFormat(header, '\t');
        expect(missing).to.be.an('array').that.is.empty;
    });

    it('should allow extra columns in CSV', () => {
        const header = [...ALL_COLUMNS, 'extracolumn', 'anotherextra'].join(';');
        const missing = CheckInputFileFormat(header, ';');
        expect(missing).to.be.an('array').that.is.empty;
    });

    it('should return all columns as missing for empty header', () => {
        const missing = CheckInputFileFormat('', ';');
        expect(missing.length).to.equal(ALL_COLUMNS.length);
    });
});
