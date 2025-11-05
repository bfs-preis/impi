import { expect } from 'chai';
import 'mocha';

import { checkValidationRules } from '../src/validation/checkValidationRules.js';
import { IBankDataCsv } from '../src/types/IBankDataCsv.js';
import { PeriodeDefinition } from '../src/validation/ValidationRules.js';
import { csvTestfileValidation } from './Constants.js';
import * as fs from 'fs';

import { parse } from 'csv-parse/sync';

/// taken from rxjs 5.x Code
const isArray = Array.isArray || (<T>(x: any): x is T[] => x && typeof x.length === 'number');
function isNumeric(val: any): boolean {
    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    // subtraction forces infinities to NaN
    // adding 1 corrects loss of precision from parseFloat (#15100)
    return !isArray(val) && (val - parseFloat(val) + 1) >= 0;
};


describe('default validation tests (' + csvTestfileValidation + ')', () => {

    // Set the validation period (dates in test data are 16.07.2018, which should be outside this period)
    PeriodeDefinition.PeriodFrom = new Date(2017, 0, 1); // January 1, 2017
    PeriodeDefinition.PeriodTo = new Date(2017, 2, 31); // March 31, 2017

    const records = parse(fs.readFileSync(csvTestfileValidation, { encoding: 'latin1' }), {
        columns: true,
        skip_empty_lines: true,
        delimiter: ";",
        bom: true
    });

    records.forEach((row: { Community: any; Street: any; StreetNumber: any; ZipCode: any; StandardOfVolume: any; CondominiumType: any; ConstructionQuality: any; LandArea: any; NetLivingArea: any; NumberOfBathrooms: any; NumberOfParkings: any; NumberOfRooms: any; ObjectType: any; OwnerOccupiedOrRented: any; Price: any; PrimaryOrSecondaryHome: any; PropertyCondition: any; SingleFamilyHouseType: any; TransactionDate: any; VolumeOfBuilding: any; YearOfConstruction: any; Fehlertyp: string; Bemerkung: string; ValidationNr: any; }, index: string) => {
        const input: IBankDataCsv = {
            community: row.Community,
            street: row.Street,
            streetnumber: row.StreetNumber,
            zipcode: row.ZipCode,
            standardofvolume: row.StandardOfVolume,
            condominiumtype: row.CondominiumType,
            constructionquality: row.ConstructionQuality,
            landarea: row.LandArea,
            netlivingarea: row.NetLivingArea,
            numberofbathrooms: row.NumberOfBathrooms,
            numberofparkings: row.NumberOfParkings,
            numberofrooms: row.NumberOfRooms,
            objecttype: row.ObjectType,
            owneroccupiedorrented: row.OwnerOccupiedOrRented,
            price: row.Price,
            primaryorsecondaryhome: row.PrimaryOrSecondaryHome,
            propertycondition: row.PropertyCondition,
            singlefamilyhousetype: row.SingleFamilyHouseType,
            transactiondate: row.TransactionDate,
            volumeofbuilding: row.VolumeOfBuilding,
            yearofconstruction: row.YearOfConstruction,
        };

        it('should have ' + row.Fehlertyp + " Case:" + index + " Desc:" + row.Bemerkung, (done) => {
            const result = checkValidationRules(input)
            const vr = result.ViolatedRules.find((v) => v.Id === +(row.ValidationNr));
            if (!vr) {
                if (input.objecttype.length === 0 || !isNumeric(input.objecttype) || input.netlivingarea.length == 0) console.log('true1');

                console.log(Number(input.objecttype) == 2);
                console.log(Number(input.netlivingarea) > 999999);

                console.log(isNumeric(input.netlivingarea));

                console.log(Number(input.netlivingarea) > 999999 || !isNumeric(input.netlivingarea));
                console.log(input);
                console.log(result);
            }

            if (+(row.ValidationNr) > 3) {

                expect(result.ViolatedRules.length == 2);
                expect(result.ViolatedRules.find((v) => v.Id === 3)).to.not.be.undefined;
            }else{
                expect(result.ViolatedRules.length == 1);
            }
            
            expect(vr).to.not.be.null;
            expect(vr).to.not.be.undefined;
            done();
        });


    });
})
