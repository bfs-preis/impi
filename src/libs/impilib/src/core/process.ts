import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import {transform,Options as TransformOption} from 'stream-transform';
import { parse,Options } from 'csv-parse';
import {stringify} from 'csv-stringify';
import moment from 'moment';
import archiver from 'archiver';

import { createSedexEnvelope } from './sedex-envelope.js';
import { IBankDataCsv, BankDataCsv } from '../types/IBankDataCsv.js';
import { ResultDataCsv } from '../types/ResultDataCsv.js';
import { checkValidationRules, ICheckValidationRuleResult } from '../validation/checkValidationRules.js';
import { PeriodeDefinition } from '../validation/ValidationRules.js';
import { match } from '../match/match.js';
import { GeoDatabase } from '../match/GeoDatabase.js';

import { ILogRow, ILogResult, ILogViolation, ILogMeta } from '../index.js';
import { LogAsXmlString, createEmptyLogMatchingTypeArray } from './log-file-xml.js';

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

    const missingColumns: string[] = [];
    for (const p of Object.getOwnPropertyNames(new BankDataCsv())) {
        if (row[p] === undefined) {
            missingColumns.push(p);
        }
    }
    return missingColumns;
}

export function CheckInputFileFormat(headerLine: string, delimiter: string) {
    const missingColumns: string[] = [];
    const headerFields = headerLine.split(delimiter).map(c => c.toLowerCase());
    for (const p of Object.getOwnPropertyNames(new BankDataCsv())) {
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

    const fileName = "data_" + moment().format("YYYYMMDDHHmmss");

    const violations: ILogViolation[] = [];

    const result: ILogResult = {
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
            ClientVersion: options.ClientVersion || "unknown",

        } as ILogMeta,
        Mapping: undefined,
        MatchSummary: createEmptyLogMatchingTypeArray(),
        Violations: violations,
        Rows: [] as ILogRow[],
        Error: undefined
    };

    //Error Handline
    const handlingError = (err: Error) => {
        geodb.close();
        result.Meta.EndTime = +new Date();
        result.Error = err;
        try {
            writeZipFile(options.OutputPath, fileName, LogAsXmlString(result))
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

    const inputStream = fs.createReadStream(options.InputCsvFile);
    inputStream.on('error', function (err: Error) {
        handlingError(err);
    });

    //Csv Parser
    const parser = parse({
        delimiter: options.CsvSeparator,
        columns: (columns: string[]): string[] => {
            return columns.map((column) => {
                return column.toLowerCase();
            });
        }
    } as Options);

    parser.on('error', function (err: Error) {
        handlingError(err);
    });

    //Create GeoDatabase
    const geodb = new GeoDatabase(options.DatabaseFile.toString(), handlingError);

    //Transformer
    let rowNumber = 1;
    const transformer = transform({ parallel: 1 } as TransformOption,(record: any, callback: (err: Error | null, data: any) => void) => {
        myTransform(record, callback, result, rowNumber, geodb, mappingObj);
        rowNumber++;
    }, undefined);

    transformer.on('error', function (err: Error) {
        handlingError(err);
    });

    //Stringifier
    const stringfier = stringify({ header: true, delimiter: ";" });

    stringfier.on('error', function (err: Error) {
        handlingError(err);
    });

    let rowNumberStringifier = 0;
    stringfier.on('data', () => {
        rowCallback(rowNumberStringifier, options.CsvRowCount - 1);
        rowNumberStringifier++;
    });

    //Output
    const outputStream = fs.createWriteStream(path.join(options.OutputPath, fileName + ".csv"), { encoding: "utf8" });

    outputStream.on('error', function (err: Error) {
        handlingError(err);
    });

    outputStream.on('finish', function () {
        geodb.close();
        result.Meta.EndTime = +new Date();
        writeZipFile(options.OutputPath, fileName, LogAsXmlString(result))
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
        const missingColumns = IsBankDataCsvRow(record);
        if (missingColumns.length != 0) {
            callback(new Error("Missing Columns:" + missingColumns.join(",")), null);
        }
    }

    //Mappings
    if (mappingObject.Mappings) {
        for (const p of Object.getOwnPropertyNames(mappingObject.Mappings)) {
            if (record[p]) {
                for (const pr of Object.getOwnPropertyNames(mappingObject.Mappings[p])) {
                    if (pr === record[p]) {
                        record[p] = mappingObject.Mappings[p][pr];
                    }
                }
            }
        }
    }

    //Validate
    const result: ICheckValidationRuleResult = checkValidationRules(record as IBankDataCsv);

    //Store Validation Results
    for (const rule of result.ViolatedRules) {

        let violation = processResult.Violations.find((v) => {
            return v.Id === rule.Id;
        });

        if (violation === undefined) {
            violation = { Id: rule.Id, Text: rule.Message, RedFlag: rule.RedFlag, Count: 0, Rows: [] } as ILogViolation;
            processResult.Violations.push(violation);
        }
        violation.Rows.push(rowNumber);
        violation.Count++;
    }

    //Copy Data to output object
    const outRecord: ResultDataCsv = new ResultDataCsv();
    for (const k in outRecord) {
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
        const logMatchigType = processResult.MatchSummary.find((m) => m.Id == +(matchingType));
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
            for (const k in record) {

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

function writeZipFile(outputPath: string, fileName: String, log: string): Promise<void> {

    return new Promise((resolve, reject) => {
        const zipOutputStream = fs.createWriteStream(path.join(outputPath, fileName + ".zip"), { encoding: "utf8" });

        const archive = archiver('zip', {
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

        const logFileName = fileName.replace("data_", "log_");
        archive.append(log.replace(/\n/g, "\r\n"), { name: (logFileName + ".xml") });

        archive.finalize();
    });
}

function writeEnvelope(sedexSenderId: string, outputPath: string, fileName: String): void {

    const xml = createSedexEnvelope(sedexSenderId, fileName.replace("data_", ""));
    fs.writeFileSync(path.join(outputPath, fileName.replace("data_", "envl_") + ".xml"), xml, { encoding: "utf8" });
}
