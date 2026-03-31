import { processFile, ILogResult, IProcessOption, IDbInfo, GeoDatabase } from 'impilib';
import log from 'electron-log';
import { ICommandLine, CommandEnum } from './command-line.js';
import { ValidateDatabase, ValidateInputCsv, ValidateOutputDir } from '../validation/input-validation.js';
import { app } from 'electron';
import ora from 'ora';
import pc from 'picocolors';

export async function CliProcess(commandLine: ICommandLine): Promise<number> {

    if (commandLine.Command !== CommandEnum.Cli) throw new Error("Only Cli Command allowed in here");

    const top_start = Date.now();

    const handleError = (error: Error | unknown) => {
        spinners[currentSpinnerIndex].spinner.fail(spinners[currentSpinnerIndex].spinner.text + " " + error);
        log.error(error);
    }

    const spinners = [
        { name: 'Validate Database', spinner: ora('Validate Database') },
        { name: 'Validate Input File', spinner: ora('Validate Input File') },
        { name: 'Validate Output Folder', spinner: ora('Validate Output Folder') },
        { name: 'Processing', spinner: ora('Processing') },
    ]

    if (commandLine.KFactorTest) {
        spinners.splice(3, 0, { name: 'Check K-Factor', spinner: ora('Check K-Factor') });
    }

    const nicetime = (ms: number, use_seconds: boolean = false) => {
        let seconds: string = (ms / (use_seconds ? 1 : 1000)).toFixed((use_seconds ? 0 : 3));
        let minutes: string = (+seconds / 60).toFixed(3);
        let time = (+minutes < 1) ? seconds : minutes;
        return time + (+minutes < 1 ? 's' : 'm');
    };

    let spinningText = (rows: number, maxRows: number, start: number) => {
        spinners[currentSpinnerIndex].spinner.text = pc.magenta(spinners[currentSpinnerIndex].name) + " | Processed Rows --> " + pc.yellow(rows.toString()) + "/" + pc.yellow(maxRows.toString()) + " | " + "Time --> " + pc.yellow(nicetime((Date.now() - start))) + " | " + pc.yellow(rows > 0 ? (rows / ((Date.now() - start) / 1000)).toFixed().toString() : "0") + " rows/s";
    };

    let currentSpinnerIndex = 0;

    try {

        spinners[currentSpinnerIndex].spinner.start();
        let dbInfo = await ValidateDatabase(commandLine.DBFile);
        spinners[currentSpinnerIndex].spinner.succeed();
        currentSpinnerIndex++;
        spinners[currentSpinnerIndex].spinner.start();
        let rowcount = await ValidateInputCsv(commandLine.CSVFile, commandLine.CSVSeparator);
        spinners[currentSpinnerIndex].spinner.succeed();
        currentSpinnerIndex++;
        spinners[currentSpinnerIndex].spinner.start();
        let outputDirValid = await ValidateOutputDir(commandLine.OutputDir);


        if (!outputDirValid) {
            handleError(new Error("Output Directory not found!"));
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
            }
            else {
                spinners[currentSpinnerIndex].spinner.fail();
            }
            currentSpinnerIndex++;
        }

        let options: IProcessOption = {
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
            ClientVersion: app.getVersion(),
        };

        const start = Date.now();
        spinners[currentSpinnerIndex].spinner.start();
        let process: Promise<number> = new Promise((resolve, reject) => {
            processFile(options,
                (result: ILogResult) => {
                    if (result.Error) {
                        handleError(result.Error);
                        return resolve(1);
                    }
                    spinners[currentSpinnerIndex].spinner.succeed();
                    console.log("Overall Time: " + pc.yellow(nicetime((Date.now() - top_start))));
                    return resolve(0);
                }, (processedRow: number, maxRows: number) => {
                    //do nothing in cli
                    spinningText(processedRow, maxRows, start);
                });
        });

        return await process;
    }
    catch (error) {
        handleError(error);
        return 1;
    }
}