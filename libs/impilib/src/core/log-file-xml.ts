import * as xmlbuilder from 'xmlbuilder';
import * as xmlreader from './xmlreader';
import * as unzip from 'unzip';
import * as fs from "fs";
import * as moment from 'moment';
import { ILogResult } from './log-result';
import { ILogMeta, ILogViolation, ILogMatchingType, ILogRow, MatchingTypeEnum } from '..';


export function createEmptyLogMatchingTypeArray(): ILogMatchingType[] {
    let map: ILogMatchingType[] = [];

    for (var n in MatchingTypeEnum) {
        if (typeof MatchingTypeEnum[n] === 'number') {
            map.push({ Id: <any>MatchingTypeEnum[n], Name: n, Count: 0 });
        }
    }
    return map
}

export function readResultZipFile(file: string, callback: (result: ILogResult) => void) {
    if (!fs.existsSync(file)) {
        throw new Error("File doesnt exists!");
    }

    fs.createReadStream(file)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            let fileName: string = entry.path;
            var type = entry.type; // 'Directory' or 'File'
            var size = entry.size;
            if (fileName.endsWith(".xml")) {
                streamToString(entry, (data: string) => {
                    xmlreader.read(data, function (err, res) {

                        let mapping:any={
                            Mappings:{},
                            Scales:{}
                        };
                        res.Log.Mapping.at(0).Mappings.at(0).each((c, m) => {
                            mapping.Mappings[m.name]=m.text();
                        });

                        res.Log.Mapping.at(0).Scales.at(0).each((c, m) => {
                            mapping.Scales[m.name]=m.text();
                        });

                        let matchsummary: ILogMatchingType[] = [];
                        res.Log.MatchSummery.at(0).Match.each((c, m) => {
                            matchsummary.push({
                                Id: m.attributes().Id,
                                Count: m.attributes().Count,
                                Name: m.attributes().Name
                            } as ILogMatchingType

                            );
                        });

                        let violations: ILogViolation[] = [];
                        res.Log.Violations.at(0).Rule.each((c, r) => {
                            let rows: number[] = [];
                            if (r.Row)
                                r.Row.each((c, row) => rows.push(row.text()));
                            violations.push(
                                {
                                    Id: r.attributes().Id,
                                    Text: r.attributes().Text,
                                    Count: r.attributes().Count,
                                    Rows: rows,
                                    RedFlag: (r.attributes().RedFlag === 'true')
                                } as ILogViolation);
                        })

                        let rows: ILogRow[] = []
                        res.Log.Rows.at(0).Row.each((c, m) => {
                            let logRow = {

                                Index: m.attributes().Index,
                                MatchingType: m.attributes().MatchingType,
                                Violations: []

                            } as ILogRow;

                            m.Violation.each((i, n) => {
                                logRow.Violations.push(n.text());
                            });
                            rows.push(logRow);
                        });

                        callback({
                            Meta: {
                                ClientVersion: res.Log.Meta.at(0).attributes().ClientVersion,
                                CsvEncoding: res.Log.Meta.at(0).attributes().CsvEncoding,
                                CsvDelimiter: res.Log.Meta.at(0).attributes().CsvDelimiter,
                                CsvRowCount: res.Log.Meta.at(0).attributes().CsvRowCount,
                                CsvSeparator: res.Log.Meta.at(0).attributes().CsvSeparator,
                                DbPeriodFrom: moment(res.Log.Meta.at(0).attributes().DbPeriodFrom, "DD.MM.YYYY").valueOf(),
                                DbPeriodTo: moment(res.Log.Meta.at(0).attributes().DbPeriodTo, "DD.MM.YYYY").valueOf(),
                                DbVersion: res.Log.Meta.at(0).attributes().DbVersion,
                                EndTime: moment(res.Log.Meta.at(0).attributes().EndTime, "DD.MM.YYYY HH:mm:ss").valueOf(),
                                StartTime: moment(res.Log.Meta.at(0).attributes().StartTime, "DD.MM.YYYY HH:mm:ss").valueOf(),
                                MappingFile: res.Log.Meta.at(0).attributes().MappingFile,
                                OutZipFile: res.Log.Meta.at(0).attributes().OutZipFile,
                                SedexSenderId: res.Log.Meta.at(0).attributes().SedexSenderId,
                            } as ILogMeta,
                            Error: res.Log.Exception ? res.Log.Exception.at(0).text() : null,
                            Mapping: mapping,
                            MatchSummary: matchsummary,
                            Rows: rows,
                            Violations: violations








                        } as ILogResult);
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

export function LogAsXmlString(result: ILogResult): string {
    let root = _generateXml(result);
    return root.end({
        pretty: true,
        allowEmpty: false
    });
}



function _generateXml(result: ILogResult, writeRows: boolean = true): any {

    let root = xmlbuilder.create('Log', { encoding: 'utf-8' });

    root.ele("Meta", {
        "StartTime": moment(result.Meta.StartTime).format("DD.MM.YYYY HH:mm:ss"),
        "EndTime": moment(result.Meta.EndTime).format("DD.MM.YYYY HH:mm:ss"),
        "Duration": moment(moment(result.Meta.EndTime).diff(moment(result.Meta.StartTime))).format("mm[m]:ss[s]"),
        "DbVersion": result.Meta.DbVersion,
        "DbPeriodFrom": moment(result.Meta.DbPeriodFrom).format("DD.MM.YYYY"),
        "DbPeriodTo": moment(result.Meta.DbPeriodTo).format("DD.MM.YYYY"),
        "CsvEncoding": result.Meta.CsvEncoding,
        "CsvDelimiter": result.Meta.CsvSeparator,
        "CsvRowCount": result.Meta.CsvRowCount,
        "OutZipFile": result.Meta.OutZipFile,
        "MappingFile": result.Meta.MappingFile,
        "ClientVersion": result.Meta.ClientVersion
    });

    //Mapping
    if (result.Mapping) {
        let mappingElement = root.ele("Mapping");
        let mappingsElement = mappingElement.ele("Mappings");

        for (let p of Object.getOwnPropertyNames(result.Mapping.Mappings)) {
            let nameElement = mappingsElement.ele(p);
            for (let pr of Object.getOwnPropertyNames(result.Mapping.Mappings.Mappings[p])) {
                nameElement.ele(pr).txt(result.Mapping.Mappings.Mappings[p][pr]);
            }

        }

        let scalesElement = mappingElement.ele("Scales");
        for (let p of Object.getOwnPropertyNames(result.Mapping.Scales)) {
            let nameElement = mappingsElement.ele(p).txt(result.Mapping.Scales[p]);
        }
    }

    //MatchSummery
    let matchSummeryElement = root.ele("MatchSummery");
    for (let m of result.MatchSummary.sort((m1, m2) => m1.Id - m2.Id)) {
        matchSummeryElement.ele("Match", {
            "Id": m.Id,
            "Text": m.Name,
            "Count": m.Count
        });
    }

    let violationsElement = root.ele("Violations");

    for (let v of result.Violations.sort((v1, v2) => v1.Id - v2.Id)) {
        let ruleElement = violationsElement.ele("Rule", {
            "Id": v.Id,
            "Name": v.Text,
            "Count": v.Rows.length,
            "RedFlag": v.RedFlag
        });

        for (let rows of v.Rows) {
            ruleElement.ele("Row").txt(rows);
        }

    }

    let rowsElement = root.ele("Rows");

    for (let row of result.Rows) {
        let indexElement = rowsElement.ele("Row", {
            "Index": row.Index,
            "MatchingType": row.MatchingType,
        });
        for (let v of row.Violations) {
            indexElement.ele("Violation").txt(v);
        }
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