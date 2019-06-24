import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import * as transform from 'stream-transform';
import * as parse from 'csv-parse';
import * as stringify from 'csv-stringify';
import * as moment from 'moment';
import * as archiver from 'archiver';

import { createSedexEnvelope } from './sedex-envelope';
import { IBankDataCsv, BankDataCsv } from '../types/IBankDataCsv';
import { ResultDataCsv } from '../types/ResultDataCsv';
import { checkValidationRules, ICheckValidationRuleResult } from '../validation/checkValidationRules';
import { PeriodeDefinition } from '../validation/ValidationRules';
import { match } from '../match/match';
import { GeoDatabase } from '../match/GeoDatabase';
import { ILogResult, ILogViolation, ILogMeta, ToJson, createEmptyLogMatchingTypeArray } from './log-file-json';
import { ILogRow } from '..';

export interface IProcessOption {
    InputCsvFile: string;
    CsvEncoding: string;
    CsvSeparator: string;
    DatabaseFile: String;
    OutputPath: string;
    DbVersion: string;
    DbPeriodFrom: number;
    DbPeriodTo: number;
    CsvRowCount: number;
    SedexSenderId: string;
    MappingFile: string;
    ClientVersion: string;
}

function IsBankDataCsvRow(row: any): string[] {

    let missingColumns: string[] = [];
    for (let p of Object.getOwnPropertyNames(new BankDataCsv())) {
        if (row[p] === undefined) {
            missingColumns.push(p);
        }
    }
    return missingColumns;
}

export function CheckInputFileFormat(headerLine: string, delimiter: string) {
    let missingColumns: string[] = [];
    let headerFields = headerLine.split(delimiter).map(c => c.toLowerCase());
    for (let p of Object.getOwnPropertyNames(new BankDataCsv())) {
        if (!headerFields.find((e) => e === p)) {
            missingColumns.push(p);
        }
    }
    return missingColumns;
}

// tslint:disable-next-line:max-line-length
export function processFile(options: IProcessOption, callback: (result: ILogResult) => void, rowCallback: (processedRow: number, maxRows: number) => void) {

    //Static Data Init
    PeriodeDefinition.PeriodFrom = new Date(options.DbPeriodFrom);
    PeriodeDefinition.PeriodTo = new Date(options.DbPeriodTo);

    let fileName = "data_" + moment().format("YYYYMMDDHHmmss");

    let violations: ILogViolation[] = [];

    let result: ILogResult = {
        Meta: {
            StartTime: +new Date(),
            EndTime: 0,
            OutZipFile: path.join(options.OutputPath, fileName + ".zip"),
            CsvEncoding: options.CsvEncoding,
            CsvSeparator: options.CsvSeparator,
            DbPeriodFrom: options.DbPeriodFrom,
            DbPeriodTo: options.DbPeriodTo,
            DbVersion: options.DbVersion,
            SedexSenderId: options.SedexSenderId,
            MappingFile: options.MappingFile,
            CsvRowCount: options.CsvRowCount,
            ClientVersion: options.ClientVersion,

        } as ILogMeta,
        Mapping: undefined,
        MatchSummary: createEmptyLogMatchingTypeArray(),
        Violations: violations,
        Rows: [] as ILogRow[],
        Error: undefined
    };

    //Error Handline
    let handlingError = (err: Error) => {
        geodb.close();
        result.Meta.EndTime = +new Date();
        result.Error = err;
        try {
            writeZipFile(options.OutputPath, fileName, ToJson(result), ToJson(result, true))
                .then(() => {
                    writeEnvelope(options.SedexSenderId, options.OutputPath, fileName);
                    return callback(result);
                });
        } catch (error) {
            console.log(error);
            return callback(result);
        }
    };

    //Load Mapping File
    let mappingObj = {};
    if (options.MappingFile && fs.existsSync(options.MappingFile)) {
        fs.readFile(options.MappingFile, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                handlingError(err);
            }
            mappingObj = JSON.parse(data);
            result.Mapping = mappingObj;
        });
    }

    let inputStream = fs.createReadStream(options.InputCsvFile);
    inputStream.on('error', function (err: Error) {
        handlingError(err);
    });

    //Csv Parser
    let parser = parse({
        delimiter: options.CsvSeparator,
        columns: (columns: string[]): string[] => {
            return columns.map((column) => {
                return column.toLowerCase();
            });
        }
    } as parse.Options);

    parser.on('error', function (err: Error) {
        handlingError(err);
    });

    //Create GeoDatabase
    let geodb = new GeoDatabase(options.DatabaseFile.toString(), handlingError);

    //Transformer
    let rowNumber = 1;
    let transformer = transform((record: any, callback: (err: Error | null, data: any) => void) => {
        myTransform(record, callback, result, rowNumber, geodb, mappingObj);
        rowNumber++;
    }, { parallel: 1 });

    transformer.on('error', function (err: Error) {
        handlingError(err);
    });

    //Stringifier
    let stringfier = stringify({ header: true, delimiter: ";" });

    stringfier.on('error', function (err: Error) {
        handlingError(err);
    });

    let rowNumberStringifier = 0;
    stringfier.on('data', () => {
        rowCallback(rowNumberStringifier, options.CsvRowCount - 1);
        rowNumberStringifier++;
    });

    //Output
    let outputStream = fs.createWriteStream(path.join(options.OutputPath, fileName + ".csv"), { encoding: "utf8" });

    outputStream.on('error', function (err: Error) {
        handlingError(err);
    });

    outputStream.on('finish', function () {
        geodb.close();
        result.Meta.EndTime = +new Date();
        writeZipFile(options.OutputPath, fileName, ToJson(result), ToJson(result, true))
            .then(() => {
                writeEnvelope(options.SedexSenderId, options.OutputPath, fileName);
                callback(result);
            });
    });

    //Process
    inputStream
        .pipe(iconv.decodeStream(options.CsvEncoding))
        .pipe(parser)
        .pipe(transformer)
        .pipe(stringfier)
        .pipe(outputStream);

}

// tslint:disable-next-line:max-line-length
function myTransform(record: any, callback: (err: Error | null, data: any) => void, processResult: ILogResult, rowNumber: number, geodb: GeoDatabase, mappingObject: any) {

    //Check headers
    if (rowNumber === 1) {
        let missingColumns = IsBankDataCsvRow(record);
        if (missingColumns.length != 0) {
            callback(new Error("Missing Columns:" + missingColumns.join(",")), null);
        }
    }

    //Mappings
    if (mappingObject.Mappings) {
        for (let p of Object.getOwnPropertyNames(mappingObject.Mappings)) {
            if (record[p]) {
                for (let pr of Object.getOwnPropertyNames(mappingObject.Mappings[p])) {
                    if (pr === record[p]) {
                        record[p] = mappingObject.Mappings[p][pr];
                    }
                }
            }
        }
    }

    //Validate
    let result: ICheckValidationRuleResult = checkValidationRules(record as IBankDataCsv);

    //Store Validation Results
    for (let rule of result.ViolatedRules) {

        let violation = processResult.Violations.find((v) => {
            return v.Id === rule.Id;
        });

        if (violation === undefined) {
            violation = { Id: rule.Id, Text: rule.Message, RedFlag: rule.RedFlag, Count: 0 } as ILogViolation;
            processResult.Violations.push(violation);
        }
        violation.Count++;
    }

    //Copy Data to output object
    let outRecord: ResultDataCsv = new ResultDataCsv();
    for (let k in outRecord) {
        if (record.hasOwnProperty(k)) {
            outRecord[k] = record[k];
        }
        //Translate yearofconstruction to nomenclatur
        if (k === 'yearofconstruction') {
            let year: number = isNaN(+record[k]) ? 0 : +record[k];
            if (year > 0) {
                if (year < 1919) {
                    year = 1;
                }
                else if (year >= 1919 && year <= 1945) {
                    year = 2;
                }
                else if (year >= 1946 && year <= 1970) {
                    year = 3;
                }
                else if (year >= 1971 && year <= 1990) {
                    year = 4;
                }
                else if (year >= 1991 && year <= 2005) {
                    year = 5;
                }
                else if (year >= 2006 && year <= 2015) {
                    year = 6;
                } else if (year > 2015) {
                    year = 7;
                }
            }
            outRecord[k] = year.toString();
        }
    }

    //Store ValidationFlags
    outRecord.validationflags = result.Flags.toString();

    //GWR & Geodata
    return match((record as IBankDataCsv), geodb, (record, err, matchingType) => {
        outRecord.matchingtype = (+matchingType).toString();

        //MatchingType Summary
        let logMatchigType = processResult.MatchSummary.find((m) => m.Id == +(matchingType));
        if (logMatchigType) {
            logMatchigType.Count++;
        } else {
            throw new Error("MatchingType not found in Summary!");
        }

        processResult.Rows.push({ Index: rowNumber, MatchingType: matchingType, Violations: result.ViolatedRules.map((r) => r.Id) } as ILogRow);
        if (err) {
            return callback(err, outRecord);
        }
        if (record) {
            //Copy Values
            for (let k in record) {

                if (k.replace(/_/g, "") === 'yearofconstruction') continue; // dont copy yearofconstruction from gwr, always take bank data

                if (outRecord.hasOwnProperty(k.replace(/_/g, ""))) {
                    outRecord[k.replace(/_/g, "")] = record[k];
                }
            }
            return callback(null, outRecord);
        }

        return callback(null, outRecord);

    });
}

function writeZipFile(outputPath: string, fileName: String, log: string, smallLog: string): Promise<any> {

    return new Promise((resolve, reject) => {
        let zipOutputStream = fs.createWriteStream(path.join(outputPath, fileName + ".zip"), { encoding: "utf8" });

        let archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });


        zipOutputStream.on('close', function () {

            if (fs.existsSync(path.join(outputPath, fileName + ".csv")))
                fs.unlinkSync(path.join(outputPath, fileName + ".csv"));
            resolve();
        });

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning
                console.log(err);
            } else {
                // throw error
                console.log(err);
                reject(err);
            }
        });

        // good practice to catch this error explicitly
        archive.on('error', function (err) {
            console.log(err);
            reject(err);
        });

        archive.pipe(zipOutputStream);
        if (fs.existsSync(path.join(outputPath, fileName + ".csv"))) {
            archive.append(fs.createReadStream(path.join(outputPath, fileName + ".csv")), { name: (fileName + ".csv") });
        }

        let logFileName = fileName.replace("data_", "log_");
        archive.append(log.replace(/\n/g, "\r\n"), { name: (logFileName + ".json") });
        archive.append(smallLog.replace(/\n/g, "\r\n"), { name: (logFileName + "_small.json") });


        archive.finalize();
    });
}

function writeEnvelope(sedexSenderId: string, outputPath: string, fileName: String): void {

    let xml = createSedexEnvelope(sedexSenderId, fileName.replace("data_", ""));
    fs.writeFileSync(path.join(outputPath, fileName.replace("data_", "envl_") + ".xml"), xml, { encoding: "utf8" });
}
