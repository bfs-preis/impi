import { expect, assert } from 'chai';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';
import { GeoDatabase } from '../src/match/GeoDatabase';
import { match, MatchingTypeEnum } from '../src/match/match';
import { IBankDataCsv } from '../src/types/IBankDataCsv';
import { IBuildingRecord } from '../src/types/IBuildingRecord';

describe('simple matching tests', () => {

    let geoDatabase = new GeoDatabase('/vagrant/Data/geodbv8.db', (error) => {
        console.log(error);
    });

    let testCases = [
        "Kanalstrasse;2a;4415;Lausen;0",
        "Dorfstrasse;12;8236;Büttenhardt;0",
        "Dorfstrasse;12;8236;Thayngen;0",
        "Bürenstrasse;45;3000;Bern;0", // Fail cause :"Doesnt find Alternate PLZ"
        "Mattenweg;6;3250;Lyss;1",
        "Hofwilstrasse;;3053;Münchenbuchsee;1",
        "Dorfstrasse;;8236;Büttenhardt;1",
        "Dorfstrasse;;8236;Thayngen;1",
        "Dorfstrasse;99;8236;Büttenhardt;1",
        "Dorfstrasse;99;8236;Thayngen;1",
        "Bürenstrasse;;3006;Bern;1",// Fail cause :"Doesnt find Alternate PLZ"
        "Rue de la fantaisie;;3012;Bern;2",
        "Erfinderstrasse;123;3053;Diemerswil;2",
        "Erfinderstrasse;123;3053;Münchenbuchsee;2",
    ];

    testCases.forEach((testCase, index) => {
        let splited = testCase.split(";");
        let input: IBankDataCsv = {
            community: splited[3],
            street: splited[0],
            streetnumber: splited[1],
            zipcode: splited[2],
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

        it('should have ' + MatchingTypeEnum[splited[4]] + " Case:" + index, (done) => {

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
                        expect(result.matchingType).to.equal(+(splited[4]));
                        done();
                    }
                    catch (e) {
                        return done(e);
                    }
                });
        });
    });
})
