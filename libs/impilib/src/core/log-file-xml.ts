import * as xmlbuilder from 'xmlbuilder';
import * as xmlreader from 'xmlreader';
import * as unzip from 'unzip';
import * as fs from "fs";
import * as path from "path";
import * as moment from 'moment';

import { IProcessResult, IProcessOption, IViolation } from "./process";

export function readResultZipFile(file: string, callback: (result: IProcessResult) => void) {
    if (!fs.existsSync(file)) {
        throw new Error("File doesnt exists!");
    }

    fs.createReadStream(file)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            let fileName: string = entry.path;
            var type = entry.type; // 'Directory' or 'File'
            var size = entry.size;
            if (fileName.endsWith(".xml") && !fileName.endsWith("small.xml")) {
                streamToString(entry, (data: string) => {
                    xmlreader.read(data, function (err, res) {
                        let matchsummary: number[] = [];
                        res.Log.Matches.at(0).Match.each((c,m) => {
                            matchsummary.push(m.attributes().Count);
                        })
               
                        let validations: IViolation[] = [];
                        res.Log.Violations.at(0).Rule.each((c,r) => {
                            let rows:number[]=[];
                            if (r.Row)
                                r.Row.each((c,row) => rows.push(row.text()));
                            validations.push(
                                {
                                    Id: r.attributes().Id,
                                    Text: r.attributes().Text,
                                    Rows: rows,
                                    RedFlag:(r.attributes().RedFlag==='true')
                                } as IViolation);
                        })

                        callback( {
                            StartTime: moment(res.Log.Meta.at(0).attributes().StartTime,"DD.MM.YYYY HH:mm:ss").valueOf(),
                            EndTime: moment(res.Log.Meta.at(0).attributes().EndTime,"DD.MM.YYYY HH:mm:ss").valueOf(),
                            Error: res.Log.Exception ? res.Log.Exception.at(0).text() : null,
                            MatchSummary: matchsummary,
                            Options: {
                                CsvEncoding: res.Log.Meta.at(0).attributes().CsvEncoding,
                                CsvRowCount: res.Log.Meta.at(0).attributes().CsvRowCount,
                                CsvSeparator: res.Log.Meta.at(0).attributes().CsvDelimiter,
                                DatabaseFile: res.Log.Meta.at(0).attributes().DatabaseFile,
                                DbPeriodFrom: moment(res.Log.Meta.at(0).attributes().DbPeriodFrom,"DD.MM.YYYY").valueOf(),
                                DbPeriodTo: moment(res.Log.Meta.at(0).attributes().DbPeriodTo,"DD.MM.YYYY").valueOf(),
                                DbVersion: res.Log.Meta.at(0).attributes().DbVersion,
                                InputCsvFile: res.Log.Meta.at(0).attributes().InputCsvFile,
                                OutputPath: res.Log.Meta.at(0).attributes().OutputPath
                            } as IProcessOption,
                            OutZipFile: res.Log.Meta.at(0).attributes().OutZipFile,

                            Violations: validations
                        } as IProcessResult);
                    });
                });
            } else {
                entry.autodrain();
            }
        });
}

function streamToString(stream, cb) {
    const chunks: string[] = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk.toString());
    });
    stream.on('end', () => {
        cb(chunks.join(''));
    });
}

export function writeXmlLogFile(result: IProcessResult, name: string) {

    let root = _generateXml(result);

    let writeStream = fs.createWriteStream(path.join(result.Options.OutputPath, name + ".xml"), { encoding: "utf8" });
    let writer = xmlbuilder.streamWriter(writeStream, {
        pretty: true,
        allowEmpty: false
    });
    root.end(writer);
    writeStream.end();
}

export function LogAsXmlString(result: IProcessResult): string {
    let root = _generateXml(result);
    return root.end({
        pretty: true,
        allowEmpty: false
    });
}

export function SmallLogAsXmlString(result: IProcessResult): string {
    let root = _generateXml(result, false);
    return root.end({
        pretty: true,
        allowEmpty: false
    });
}

function _generateXml(result: IProcessResult, writeRows: boolean = true): any {

    let root = xmlbuilder.create('Log', { encoding: 'utf-8' });

    root.ele("Meta", {
        "StartTime": moment(result.StartTime).format("DD.MM.YYYY HH:mm:ss"),
        "EndTime": moment(result.EndTime).format("DD.MM.YYYY HH:mm:ss"),
        "Duration": moment(moment(result.EndTime).diff(moment(result.StartTime))).format("mm[m]:ss[s]"),
        "DbVersion": result.Options.DbVersion,
        "DbPeriodFrom": moment(result.Options.DbPeriodFrom).format("DD.MM.YYYY"),
        "DbPeriodTo": moment(result.Options.DbPeriodTo).format("DD.MM.YYYY"),
        "CsvEncoding": result.Options.CsvEncoding,
        "CsvDelimiter": result.Options.CsvSeparator,
        "CsvRowCount": result.Options.CsvRowCount,
        "OutZipFile": result.OutZipFile
    });

    let violationsElement = root.ele("Violations");

    for (let v of result.Violations) {
        let ruleElement = violationsElement.ele("Rule", {
            "Id": v.Id,
            "Text": v.Text,
            "Count": v.Rows.length,
            "RedFlag":v.RedFlag
        });
        if (writeRows) {
            for (let rows of v.Rows) {
                ruleElement.ele("Row").txt(rows);
            }
        }
    }

    let matchElement = root.ele("Matches");

    for (let i = 0; i < result.MatchSummary.length; i++) {
        matchElement.ele("Match",
            {
                "Id": i,
                "Count": result.MatchSummary[i]
            }
        );
    }

    if (result.Error) {
        if (result.Error.stack != undefined) {
            root.ele("Exception").cdata(result.Error.stack);
        } else {
            root.ele("Exception").cdata(result.Error.message);
        }
    }

    return root;
}