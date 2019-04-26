import { expect, assert } from 'chai';
import 'mocha';
import { GeoDatabase } from '../src/match/GeoDatabase';
import { match, MatchingTypeEnum } from '../src/match/match';
import { IBankDataCsv } from '../src/types/IBankDataCsv';
import { IBuildingRecord } from '../src/types/IBuildingRecord';
import { testDatabase, csvTestfileMatching } from './Constants';
import * as fs from 'fs';

const parse = require('csv-parse/lib/sync');

describe('default matching tests (' + csvTestfileMatching +')', () => {

    let geoDatabase = new GeoDatabase(testDatabase, (error) => {
        console.log(error);
    });

    const records = parse(fs.readFileSync(csvTestfileMatching, { encoding: 'latin1' }), {
        columns: true,
        skip_empty_lines: true,
        delimiter :";",
        bom:true
    });

    records.forEach((row, index) => {
        let input: IBankDataCsv = {
            community: row.community,
            street: row.street,
            streetnumber: row.streetnumber,
            zipcode: row.zipcode,
            standardofvolume: "",
            condominiumtype: "",
            constructionquality: "",
            landarea: "",
            netlivingarea: "",
            numberofbathrooms: "",
            numberofparkings: "",
            numberofrooms: "",
            objecttype: "",
            owneroccupiedorrented: "",
            price: "",
            primaryorsecondaryhome: "",
            propertycondition: "",
            singlefamilyhousetype: "",
            transactiondate: "",
            volumeofbuilding: "",
            yearofconstruction: "",
        };

        it('should have ' + MatchingTypeEnum[row.match] + " Case:" + index + " Desc:" + row.matchingtype, (done) => {
            let i = index;
            const myPromise: Promise<{ record: IBuildingRecord | null, matchingType: MatchingTypeEnum }> = new Promise((resolve, reject) => {
                match(input, geoDatabase, (record, err, matchingType) => {
                    if (err)
                        return reject(err);
                    else
                        return resolve({ record: record, matchingType: matchingType });
                });
            });

            myPromise
                .then((result: { record: IBuildingRecord | null, matchingType: MatchingTypeEnum }) => {
                    try {
                        //expect(result.record).not.to.be.null;
                        expect(result.matchingType).to.equal(+(row.match));
                        done();
                    }
                    catch (e) {
                        return done(e);
                    }
                });
        });
    });
})
