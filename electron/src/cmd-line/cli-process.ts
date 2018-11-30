import { processFile, IProcessResult, IProcessOption, IDbInfo } from 'impilib';
import * as log from 'electron-log';
import { ICommandLine, CommandEnum } from './command-line';
import { ValidateDatabase, ValidateInputCsv, ValidateOutputDir } from '../validation/input-validation';

export async function CliProcess(commandLine: ICommandLine): Promise<number> {

    if (commandLine.Command != CommandEnum.Cli) throw new Error("Only Cli Command allowed in here");

    let handleError = (error: any) => {
        log.error(error);
    }

    try {
        let dbInfo = await ValidateDatabase(commandLine.DBFile);
        let rowcount = await ValidateInputCsv(commandLine.CSVFile,commandLine.CSVSeparator);
        let outputDirValid = await ValidateOutputDir(commandLine.OutputDir);

        if (!outputDirValid) {
            handleError(new Error("Output Directory not found!"));
            return 1;
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
            SedexSenderId:commandLine.SedexSenderId
        };

        let process: Promise<number> = new Promise((resolve, reject) => {
            processFile(options,
                (result: IProcessResult) => {
                    if (result.Error) {
                        handleError(result.Error);
                        return resolve(1);
                    }
                    return resolve(0);
                }, (processedRow: number, maxRows: number) => {
                    //do nothing in cli
                });
        });

        return await process;
    }
    catch (error) {
        handleError(error);
        return 1;
    }
}