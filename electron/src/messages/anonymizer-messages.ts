import { ipcMain, BrowserWindow } from 'electron';
import * as log from 'electron-log';
import * as settings from 'electron-settings';

import { Main } from '../index';
import { ValidateOutputDir, ValidateInputCsv, ValidateDatabase,CheckKFactor } from '../validation/input-validation';
import { IProcessResult, IProcessOption } from 'impilib';
import { registerResultViewerMessages } from './report-viewer-messages';

let isProcessing: boolean = false;

export function registerAnonMessages() {
    ipcMain.on('background-response', (event: any, result: IProcessResult) => {
        log.silly('send background-response:' + JSON.stringify(result));
        Main.GetMainWindow().webContents.send('background-response', result);
        isProcessing = false;

        if (!result.Error) {
            Main.createResultWindow();
            Main.GetResultWindow().once('ready-to-show', () => {
                Main.GetResultWindow().show();
            });

            registerResultViewerMessages(result);
        }
    });

    ipcMain.on('background-response-row', (event: any, progress: { processedRow: number, maxRows: number }) => {
        Main.GetMainWindow().webContents.send('background-response-row', progress);
    });

    ipcMain.on('background-start', (event: any, processOptions: IProcessOption) => {
        let appSettings: any = settings.get("AppSettings");
        processOptions.CsvEncoding = appSettings.CSVEncoding;
        processOptions.CsvSeparator = appSettings.CSVSeparater;
        processOptions.InputCsvFile = appSettings.CSVFile;
        processOptions.DatabaseFile = appSettings.DBFile;
        processOptions.OutputPath = appSettings.OutDirectory;
        processOptions.SedexSenderId=appSettings.SedexSenderId;

        log.debug('send background-start:' + JSON.stringify(processOptions));
        Main.GetBackgroundWindow().webContents.send('background-start', processOptions);
        isProcessing = true;
    });

    ipcMain.on('verify db', (event: any, file: string) => {
        ValidateDatabase(file)
            .then((dbinfo) => {
                log.debug('send verify db response:' + JSON.stringify(dbinfo));
                Main.GetMainWindow().webContents.send('verify db response', { dbInfo: dbinfo, err: null });
            }).catch((error) => {
                log.debug('send verify db response:' + + error.message);
                Main.GetMainWindow().webContents.send('verify db response', { dbInfo: null, err: { message: error.message } });
            });
    });

    ipcMain.on('verify csv', (event: any, payload: { file: string, delimiter: string }) => {
        ValidateInputCsv(payload.file, payload.delimiter)
            .then((count) => {
                log.debug('send verify csv response:' + count);
                Main.GetMainWindow().webContents.send('verify csv response', { rowcount: count, err: null });
            }).catch((error: Error) => {
                log.debug('send verify csv response error:' + error.message);
                Main.GetMainWindow().webContents.send('verify csv response', { rowcount: 0, err: { message: error.message } });
            });
    });

    ipcMain.on('verify path', (event: any, path: string) => {
        ValidateOutputDir(path).then((valid) => {
            log.debug('send verify path response:' + valid);
            Main.GetMainWindow().webContents.send('verify path response', valid);
        })
    });

    ipcMain.on('checkkfactor', (event: any, file: string) => {
        CheckKFactor(file).then((check) => {
            log.debug('send checkkfactor response:' + check);
            Main.GetMainWindow().webContents.send('checkkfactor response', { check: check, err: null});
        }).catch((error) => {
            log.debug('send checkkfactor db response:' + error.message);
            Main.GetMainWindow().webContents.send('checkkfactor db response', { check: null, err: { message: error.message } });
        });
    });
}