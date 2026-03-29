import { processFile, ILogResult, IProcessOption, GeoDatabase } from 'impilib';
import { ICommandLine } from './command-line.js';
import { ValidateDatabase, ValidateInputCsv, ValidateOutputDir } from './input-validation.js';
import ora from 'ora';
import pc from 'picocolors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
    try {
        const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
        return pkg.version;
    } catch {
        return 'unknown';
    }
}

export async function CliProcess(commandLine: ICommandLine): Promise<number> {

    const top_start = Date.now();

    const handleError = (error: any) => {
        spinners[currentSpinnerIndex].spinner.fail(spinners[currentSpinnerIndex].spinner.text + ' ' + error);
        console.error(error);
    };

    const spinners = [
        { name: 'Validate Database', spinner: ora('Validate Database') },
        { name: 'Validate Input File', spinner: ora('Validate Input File') },
        { name: 'Validate Output Folder', spinner: ora('Validate Output Folder') },
        { name: 'Processing', spinner: ora('Processing') },
    ];

    if (commandLine.KFactorTest) {
        spinners.splice(3, 0, { name: 'Check K-Factor', spinner: ora('Check K-Factor') });
    }

    const nicetime = (ms: number, use_seconds: boolean = false): string => {
        const seconds: string = (ms / (use_seconds ? 1 : 1000)).toFixed(use_seconds ? 0 : 3);
        const minutes: string = (+seconds / 60).toFixed(3);
        const time = (+minutes < 1) ? seconds : minutes;
        return time + (+minutes < 1 ? 's' : 'm');
    };

    const spinningText = (rows: number, maxRows: number, start: number) => {
        spinners[currentSpinnerIndex].spinner.text = pc.magenta(spinners[currentSpinnerIndex].name) + ' | Processed Rows --> ' + pc.yellow(rows.toString()) + '/' + pc.yellow(maxRows.toString()) + ' | ' + 'Time --> ' + pc.yellow(nicetime((Date.now() - start))) + ' | ' + pc.yellow(rows > 0 ? (rows / ((Date.now() - start) / 1000)).toFixed().toString() : '0') + ' rows/s';
    };

    let currentSpinnerIndex = 0;

    try {

        spinners[currentSpinnerIndex].spinner.start();
        const dbInfo = await ValidateDatabase(commandLine.DBFile);
        spinners[currentSpinnerIndex].spinner.succeed();
        currentSpinnerIndex++;

        spinners[currentSpinnerIndex].spinner.start();
        const rowcount = await ValidateInputCsv(commandLine.CSVFile, commandLine.CSVSeparator);
        spinners[currentSpinnerIndex].spinner.succeed();
        currentSpinnerIndex++;

        spinners[currentSpinnerIndex].spinner.start();
        const outputDirValid = await ValidateOutputDir(commandLine.OutputDir);

        if (!outputDirValid) {
            handleError(new Error('Output Directory not found!'));
            return 1;
        }
        spinners[currentSpinnerIndex].spinner.succeed();
        currentSpinnerIndex++;

        if (commandLine.KFactorTest) {
            spinners[currentSpinnerIndex].spinner.start();
            const geoDatabase = new GeoDatabase(commandLine.DBFile, handleError);
            const result = await geoDatabase.kFactorCheckAsync();
            if (result) {
                spinners[currentSpinnerIndex].spinner.succeed();
            } else {
                spinners[currentSpinnerIndex].spinner.fail();
            }
            currentSpinnerIndex++;
        }

        const options: IProcessOption = {
            DbVersion: dbInfo.Version,
            DbPeriodFrom: dbInfo.PeriodFrom.valueOf(),
            DbPeriodTo: dbInfo.PeriodTo.valueOf(),
            DatabaseFile: commandLine.DBFile,
            CsvEncoding: commandLine.CSVEncoding,
            CsvRowCount: rowcount,
            CsvSeparator: commandLine.CSVSeparator,
            InputCsvFile: commandLine.CSVFile,
            OutputPath: commandLine.OutputDir,
            SedexSenderId: commandLine.SedexSenderId,
            MappingFile: commandLine.MappingFile,
            ClientVersion: getVersion(),
        };

        const start = Date.now();
        spinners[currentSpinnerIndex].spinner.start();
        const processResult: Promise<number> = new Promise((resolve) => {
            processFile(options,
                (result: ILogResult) => {
                    if (result.Error) {
                        handleError(result.Error);
                        return resolve(1);
                    }
                    spinners[currentSpinnerIndex].spinner.succeed();
                    console.log('Overall Time: ' + pc.yellow(nicetime((Date.now() - top_start))));
                    return resolve(0);
                }, (processedRow: number, maxRows: number) => {
                    spinningText(processedRow, maxRows, start);
                });
        });

        return await processResult;
    } catch (error) {
        handleError(error);
        return 1;
    }
}
