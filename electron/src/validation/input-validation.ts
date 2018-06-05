import * as log from 'electron-log';
import * as fs from 'fs';
import * as readLine from 'readline';

import { GeoDatabase, IDbInfo, CheckInputFileFormat } from 'impilib';

export function ValidateDatabase(dbFile: string): Promise<IDbInfo> {
    log.debug('ValidateDatabase:' + dbFile);
    return new Promise((resolve, reject) => {
        let handleDbError = (err: Error) => {
            log.error(err);
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
    log.debug('ValidateInputCsv:' + csvFile);

    return new Promise<number>((resolve, reject) => {
        let handleError = (err: Error) => {
            log.error(err);
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
    log.debug('ValidateOutputDir:' + outputDir);
    return new Promise((resolve, reject) => {
        fs.exists(outputDir, (exists: boolean) => resolve(exists));
    });
}
