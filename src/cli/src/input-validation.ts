import * as fs from 'fs';
import * as readLine from 'readline';
import { GeoDatabase, IDbInfo, CheckInputFileFormat } from 'impilib';

export function CheckKFactor(dbFile: string): Promise<boolean | null> {
    return new Promise((resolve, reject) => {
        const handleDbError = (err: Error) => {
            reject(err);
        };

        const database = new GeoDatabase(dbFile, handleDbError);
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
        const handleDbError = (err: Error) => {
            reject(err);
        };

        const database = new GeoDatabase(dbFile, handleDbError);
        database.verifyDb((dbInfo: IDbInfo | null, err: Error | null) => {
            if (err) {
                handleDbError(err);
            } else if (dbInfo) {
                resolve(dbInfo);
            }
        });
    });
}

export async function ValidateInputCsv(csvFile: string, delimiter: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const handleError = (err: Error) => {
            return reject(err);
        };

        if (fs.existsSync(csvFile)) {
            const lineReader = readLine.createInterface({
                input: fs.createReadStream(csvFile)
            });

            let count = 0;
            let headerLine = '';
            lineReader.on('line', function (line) {
                if (headerLine.length === 0) {
                    headerLine = line;
                }
                count++;
            });

            lineReader.on('close', function () {
                const missingColumns = CheckInputFileFormat(headerLine, delimiter);
                if (missingColumns.length > 0) {
                    return handleError(new Error('Missing Columns:' + missingColumns.join(',')));
                }
                return resolve(count);
            });
        } else {
            return handleError(new Error('File not found!'));
        }
    });
}

export function ValidateOutputDir(outputDir: string): Promise<boolean> {
    return new Promise((resolve) => {
        resolve(fs.existsSync(outputDir));
    });
}
