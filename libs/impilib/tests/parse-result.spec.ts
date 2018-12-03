/// <reference path="./chaiExtension.ts" />

import { IProcessResult, IProcessOption } from '../src/core/process';
import { readResultZipFile } from '../src/core/log-file-xml';

import { expect, use } from 'chai';

import * as moment from 'moment';
import * as fs from 'fs';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';

describe('simple result zip file', () => {
    it('should have 2 validation error', (done) => {

        let expectedResult: IProcessResult = {
            Violations:
                [{ Id: 1000, RedFlag: true, Rows: [1, 2], Text: 'Correct Rows' },
                { Id: 4, Text: 'Price is missing', RedFlag: true, Rows: [3] }],
            MatchSummary: [0, 0, 2, 0, 1, 0],
            Options:
            {
                CsvEncoding: 'utf8',
                CsvSeparator: ';',
                CsvRowCount: 10,
                DatabaseFile: '../../test-files/geodb.db',
                DbPeriodFrom: -2208992400000,
                DbPeriodTo: 32503676400000,
                DbVersion: '1.0',
                InputCsvFile: '../../test-files/BankData_errors_small.csv',
                OutputPath: './',
                SedexSenderId: ''
            },
            StartTime: 1510663936779,
            EndTime: 1510663937140,
            OutZipFile: 'data_20171114134246.zip',
            Error: null
        };

        readResultZipFile("../../test-files/data_20171114134246.zip", (result) => {
            expect(result).not.to.be.null;
            expect(result.Violations.length).to.equal(2);
            expect(result.Violations[0].Rows.length).to.equal(2);
            expect(result.Violations[1].Rows.length).to.equal(1);
            expect(result).to.be.equal(expectedResult);

            done();
        });
    });
})
