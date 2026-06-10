import { expect } from 'chai';
import 'mocha';
import { categorizeYearOfConstruction, DEFAULT_YEAR_OF_CONSTRUCTION_CATEGORIES } from '../src/core/process.js';

describe('categorizeYearOfConstruction', () => {

    describe('with default categories', () => {
        it('should return 1 for years <= 1918', () => {
            expect(categorizeYearOfConstruction('1900')).to.equal(1);
            expect(categorizeYearOfConstruction('1918')).to.equal(1);
        });

        it('should return 2 for years 1919-1945', () => {
            expect(categorizeYearOfConstruction('1919')).to.equal(2);
            expect(categorizeYearOfConstruction('1945')).to.equal(2);
        });

        it('should return 3 for years 1946-1970', () => {
            expect(categorizeYearOfConstruction('1950')).to.equal(3);
            expect(categorizeYearOfConstruction('1970')).to.equal(3);
        });

        it('should return 4 for years 1971-1990', () => {
            expect(categorizeYearOfConstruction('1985')).to.equal(4);
        });

        it('should return 5 for years 1991-2005', () => {
            expect(categorizeYearOfConstruction('2000')).to.equal(5);
        });

        it('should return 6 for years 2006-2015', () => {
            expect(categorizeYearOfConstruction('2010')).to.equal(6);
        });

        it('should return 7 for years > 2015', () => {
            expect(categorizeYearOfConstruction('2020')).to.equal(7);
            expect(categorizeYearOfConstruction('2025')).to.equal(7);
        });

        it('should return 0 for invalid values', () => {
            expect(categorizeYearOfConstruction('abc')).to.equal(0);
            expect(categorizeYearOfConstruction('')).to.equal(0);
            expect(categorizeYearOfConstruction('0')).to.equal(0);
            expect(categorizeYearOfConstruction('-1')).to.equal(0);
        });
    });

    describe('with custom categories', () => {
        const customCategories: ReadonlyArray<[number, number]> = [
            [2000, 1],
            [2020, 2],
        ];

        it('should categorize according to custom boundaries', () => {
            expect(categorizeYearOfConstruction('1990', customCategories)).to.equal(1);
            expect(categorizeYearOfConstruction('2000', customCategories)).to.equal(1);
            expect(categorizeYearOfConstruction('2010', customCategories)).to.equal(2);
            expect(categorizeYearOfConstruction('2020', customCategories)).to.equal(2);
        });

        it('should return lastCode+1 for years above last boundary', () => {
            expect(categorizeYearOfConstruction('2025', customCategories)).to.equal(3);
        });

        it('should return 0 for invalid values with custom categories', () => {
            expect(categorizeYearOfConstruction('', customCategories)).to.equal(0);
        });
    });

    describe('DEFAULT_YEAR_OF_CONSTRUCTION_CATEGORIES', () => {
        it('should have 6 entries', () => {
            expect(DEFAULT_YEAR_OF_CONSTRUCTION_CATEGORIES).to.have.lengthOf(6);
        });

        it('should be sorted by max year ascending', () => {
            for (let i = 1; i < DEFAULT_YEAR_OF_CONSTRUCTION_CATEGORIES.length; i++) {
                expect(DEFAULT_YEAR_OF_CONSTRUCTION_CATEGORIES[i][0]).to.be.greaterThan(
                    DEFAULT_YEAR_OF_CONSTRUCTION_CATEGORIES[i - 1][0]
                );
            }
        });
    });
});
