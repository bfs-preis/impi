import { expect, assert } from 'chai';
import 'mocha';
import { GeoDatabase } from '../src/match/GeoDatabase';
import { checkValidationRules } from '../src/validation/checkValidationRules';
import { IBankDataCsv } from '../src/types/IBankDataCsv';
import { testDatabase, csvTestfileValidation } from './Constants';
import * as fs from 'fs';
import { isNumeric } from 'rxjs/util/isNumeric';
const parse = require('csv-parse/lib/sync');

describe('default validation tests (' + csvTestfileValidation + ')', () => {

    let geoDatabase = new GeoDatabase(testDatabase, (error) => {
        console.log(error);
    });

    const records = parse(fs.readFileSync(csvTestfileValidation, { encoding: 'latin1' }), {
        columns: true,
        skip_empty_lines: true,
        delimiter: ";",
        bom: true
    });

    records.forEach((row, index) => {
        let input: IBankDataCsv = {
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
            let i = index;
            let result = checkValidationRules(input)
            let vr = result.ViolatedRules.find((v) => v.Id === +(row.ValidationNr));
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
