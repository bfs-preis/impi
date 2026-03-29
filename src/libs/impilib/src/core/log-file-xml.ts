import * as xmlbuilder from 'xmlbuilder2';
import * as xmlreader from './xmlreader.js';
import StreamZip from 'node-stream-zip';
import * as fs from "fs";
import moment from 'moment';
import { ILogResult } from './log-result.js';
import { ILogMeta, ILogViolation, ILogMatchingType, ILogRow, MatchingTypeEnum } from '../index.js';


export function createEmptyLogMatchingTypeArray(): ILogMatchingType[] {
    const map: ILogMatchingType[] = [];

    for (const n in MatchingTypeEnum) {
        if (typeof MatchingTypeEnum[n] === 'number') {
            map.push({ Id: <any>MatchingTypeEnum[n], Name: n, Count: 0 });
        }
    }
    return map
}

export async function readResultZipFile(file: string, callback: (result: ILogResult) => void) {
    if (!fs.existsSync(file)) {
        throw new Error("File doesnt exists!");
    }

    const zip = new StreamZip.async({ file });
    try {
        const entries = await zip.entries();
        for (const entry of Object.values(entries)) {
            if (entry.name.endsWith(".xml")) {
                const data = await zip.entryData(entry.name);
                const xmlString = data.toString('utf-8');

                xmlreader.read(xmlString, function (_, res) {

                    const mapping: any = {
                        Mappings: {},
                        Scales: {}
                    };
                    res.Log.Mapping.at(0).Mappings.at(0).each((_, m) => {
                        mapping.Mappings[m.attributes().Name] = {};
                        m.each((_, m2) => {
                            mapping.Mappings[m.attributes().Name][m2.attributes().Name] = m2.attributes().Value;
                        });
                    });

                    res.Log.Mapping.at(0).Scales.at(0).each((_, m) => {
                        mapping.Scales[m.attributes().Name] = m.attributes().Value;
                    });

                    const matchsummary: ILogMatchingType[] = [];
                    res.Log.MatchSummery.at(0).Match.each((_, m) => {
                        matchsummary.push({
                            Id: m.attributes().Id,
                            Count: m.attributes().Count,
                            Name: m.attributes().Name
                        } as ILogMatchingType);
                    });

                    const violations: ILogViolation[] = [];
                    res.Log.Violations.at(0).Rule.each((_, r) => {
                        const rows: number[] = [];
                        if (r.Row)
                            r.Row.each((_, row) => rows.push(row.text()));
                        violations.push(
                            {
                                Id: r.attributes().Id,
                                Text: r.attributes().Text,
                                Count: r.attributes().Count,
                                Rows: rows,
                                RedFlag: (r.attributes().RedFlag === 'true')
                            } as ILogViolation);
                    })

                    const rows: ILogRow[] = []
                    res.Log.Rows.at(0).Row.each((_, m) => {
                        const logRow = {
                            Index: m.attributes().Index,
                            MatchingType: m.attributes().MatchingType,
                            Violations: []
                        } as ILogRow;

                        m.Violation.each((_, n) => {
                            logRow.Violations.push(n.text());
                        });
                        rows.push(logRow);
                    });

                    callback({
                        Meta: {
                            ClientVersion: res.Log.Meta.at(0).attributes().ClientVersion,
                            CsvEncoding: res.Log.Meta.at(0).attributes().CsvEncoding,
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
                break; // Only process the first XML file
            }
        }
    } finally {
        await zip.close();
    }
}

export function LogAsXmlString(result: ILogResult): string {
    const root = _generateXml(result);
    return root.end({
        pretty: true,
        allowEmpty: false
    });
}



function _generateXml(result: ILogResult): any {

    const root = xmlbuilder.create({ encoding: 'utf-8' }).ele('Log');

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
        "ClientVersion": result.Meta.ClientVersion,
        "SedexSenderId":result.Meta.SedexSenderId
    });

    //Mapping
    if (result.Mapping) {
        const mappingElement = root.ele("Mapping");
        const mappingsElement = mappingElement.ele("Mappings");

        for (const p of Object.getOwnPropertyNames(result.Mapping.Mappings)) {
            const nameElement = mappingsElement.ele("Property",{
                "Name":p
            });
            for (const pr of Object.getOwnPropertyNames(result.Mapping.Mappings[p])) {
                nameElement.ele("PropertyValue",{
                    "Name":pr ,
                    "Value":  result.Mapping.Mappings[p][pr]
                });
            }

        }

        const scalesElement = mappingElement.ele("Scales");
        for (const p of Object.getOwnPropertyNames(result.Mapping.Scales)) {
            scalesElement.ele("ScaleProperty",{
                "Name":p,
                "Value":result.Mapping.Scales[p]
            });
        }
    }

    //MatchSummery
    const matchSummeryElement = root.ele("MatchSummery");
    for (const m of result.MatchSummary.sort((m1, m2) => m1.Id - m2.Id)) {
        matchSummeryElement.ele("Match", {
            "Id": m.Id,
            "Name": m.Name,
            "Count": m.Count
        });
    }

    const violationsElement = root.ele("Violations");

    for (const v of result.Violations.sort((v1, v2) => v1.Id - v2.Id)) {
        const ruleElement = violationsElement.ele("Rule", {
            "Id": v.Id,
            "Name": v.Text,
            "Count": v.Rows.length,
            "RedFlag": v.RedFlag
        });

        for (const rows of v.Rows) {
            ruleElement.ele("Row").txt(rows.toString());
        }

    }

    const rowsElement = root.ele("Rows");

    for (const row of result.Rows) {
        const indexElement = rowsElement.ele("Row", {
            "Index": row.Index,
            "MatchingType": row.MatchingType,
        });
        for (const v of row.Violations) {
            indexElement.ele("Violation").txt(v.toString());
        }
    }

    if (result.Error) {
        if (result.Error.stack != undefined) {
            root.ele("Exception").dat(result.Error.stack);
        } else {
            root.ele("Exception").dat(result.Error.message);
        }
    }

    return root;
}
