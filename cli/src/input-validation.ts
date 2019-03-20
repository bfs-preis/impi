import * as fs from 'fs';
import * as readLine from 'readline';

import { GeoDatabase, IDbInfo, CheckInputFileFormat } from 'impilib';

export function CheckKFactor(dbFile:string):Promise<boolean | null> {
    return new Promise((resolve, reject) => {
        let handleDbError = (err: Error) => {
            reject(err);
            return;
        };

        let database = new GeoDatabase(dbFile, handleDbError);
        database.kFactorCheck((check: boolean | null, err: Error | null) => {
            if (err) {
                handleDbError(err);
                return;
            }
            resolve(check);
        });
    });
}

export function ValidateDatabase(dbFile: string): Promise<IDbInfo> {
    return new Promise((resolve, reject) => {
        let handleDbError = (err: Error) => {
            reject(err);
            return;
        };

        let database = new GeoDatabase(dbFile, handleDbError);
        database.verifyDb((dbInfo: IDbInfo | null, err: Error | null) => {
            if (err) {
                handleDbError(err);
            }
            else if (dbInfo) {
                resolve(dbInfo);
                return;
            }
        });
    });
}

export async function ValidateInputCsv(csvFile: string, delimiter: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let handleError = (err: Error) => {
            return reject(err);
        };

        if (fs.existsSync(csvFile)) {

            var lineReader = readLine.createInterface({
                input: fs.createReadStream(csvFile)
            });

            let count = 0;
            let headerLine: string = "";
            lineReader.on('line', function (line) {
                if (headerLine.length === 0) {
                    headerLine = line;
                }
                count++
            });

            lineReader.on('close', function () {
                let missingColumns = CheckInputFileFormat(headerLine, delimiter);
                if (missingColumns.length > 0) {
                    return handleError(new Error("Missing Columns:" + missingColumns.join(",")));
                }
                return resolve(count);
            });
        }
        else {
            return handleError(new Error("File not found!"));
        }
    });
}

export function ValidateOutputDir(outputDir: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.exists(outputDir, (exists: boolean) => resolve(exists));
    });
}
