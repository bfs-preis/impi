import * as unzip from 'unzip';
import * as fs from "fs";

import { MatchingTypeEnum } from "..";

export interface ILogResult {
    Meta: ILogMeta;
    Mapping: any | undefined;
    Violations: ILogViolation[];
    MatchSummary: number[];
    Rows: ILogRow[];
    Error: Error | null | undefined;
}

export interface ILogMeta {
    CsvEncoding: string;
    CsvSeparator: string;
    CsvRowCount: number;
    DbVersion: string;
    DbPeriodFrom: number;
    DbPeriodTo: number;
    SedexSenderId: string;
    MappingFile: string;
    StartTime: number;
    EndTime: number;
    OutZipFile: string,
}

export interface ILogViolation {
    Id: number;
    Text: string;
    RedFlag: boolean;
    Count: number;
}

export interface ILogRow {
    Index: number
    MatchingType: MatchingTypeEnum;
    Violations: number[];
}

export function readResultZipFile(file: string, callback: (result: ILogResult) => void) {
    if (!fs.existsSync(file)) {
        throw new Error("File doesnt exists!");
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

    fs.createReadStream(file)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            let fileName: string = entry.path;
            var type = entry.type; // 'Directory' or 'File'
            var size = entry.size;
            if (fileName.endsWith(".json") && !fileName.endsWith("small.json")) {
                streamToString(entry, (data: string) => {
                    callback(JSON.parse(data));
                });
            } else {
                entry.autodrain();
            }
        });
}

export function ToJson(log: ILogResult, small: boolean = false): string {
    return JSON.stringify(log, (key, value) => {
        if (small && key == "Rows") {
            return undefined;
        }
        else return value;
    }, 2);
}

