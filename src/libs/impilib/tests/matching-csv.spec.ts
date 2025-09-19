import { expect } from 'chai';
import 'mocha';
import { GeoDatabase } from '../src/match/GeoDatabase.js';
import { match, MatchingTypeEnum } from '../src/match/match.js';
import { IBankDataCsv } from '../src/types/IBankDataCsv.js';
import { IBuildingRecord } from '../src/types/IBuildingRecord.js';
import { testDatabase, csvTestfileMatching } from './Constants.js';
import * as fs from 'fs';

import { parse } from 'csv-parse/sync';

describe('default matching tests (' + csvTestfileMatching +')', () => {

    const geoDatabase = new GeoDatabase(testDatabase, (error) => {
        console.log(error);
    });

    const records = parse(fs.readFileSync(csvTestfileMatching, { encoding: 'latin1' }), {
        columns: true,
        skip_empty_lines: true,
        delimiter :";",
        bom:true
    });

    records.forEach((row, index) => {
        const input: IBankDataCsv = {
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
            const myPromise: Promise<{ record: IBuildingRecord | null, matchingType: MatchingTypeEnum }> = new Promise((resolve, reject) => {
                
                match(input, geoDatabase, (record, err, matchingType) => {
                    if (index==39){
                        console.log(input);
                        console.log(matchingType);
                        console.log(row.match);
                    }
                    if (err)
                        return reject(err);
                    else
                        return resolve({ record: record, matchingType: matchingType });
                });
            });

            myPromise
                .then((result: { record: IBuildingRecord | null, matchingType: MatchingTypeEnum }) => {
                    try {
                        if (index==39){
                            console.log(result);
                            console.log(result.matchingType);
                            console.log(row.match);
                        }
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
