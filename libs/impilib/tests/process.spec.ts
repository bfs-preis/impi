/// <reference path="./chaiExtension.ts" />

import { processFile, IProcessOption, IProcessResult } from '../src/core/process';
import { expect, use } from 'chai';

import * as moment from 'moment';
import * as fs from 'fs';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';

describe('simple input file', () => {
    it('should have 2 validation error', (done) => {
        let options:IProcessOption={
            CsvEncoding:"utf8",
            CsvSeparator:";",
            CsvRowCount:10,
            DatabaseFile:"../../test-files/geodb.db",
            DbPeriodFrom:+new Date("1.1.1900"),
            DbPeriodTo:+new Date("1.1.3000"),
            DbVersion:"1.0",
            InputCsvFile:"../../test-files/BankData_errors_small.csv",
            OutputPath:"./"
        }

        processFile(options,(result=>{
            expect(result).not.to.be.null;
            expect(result.Violations.length).to.equal(2);
            expect(result.Violations[0].Rows.length).to.equal(2);
            expect(result.Violations[1].Rows.length).to.equal(1);
            //fs.unlinkSync(result.OutZipFile);
            done();

        }),()=>{});
      });
})
