import { ipcMain, app, dialog, utilityProcess } from 'electron';
import log from 'electron-log';
import * as settings from 'electron-settings';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { Main } from '../index.js';
import { ValidateOutputDir, ValidateInputCsv, ValidateDatabase, CheckKFactor } from '../validation/input-validation.js';
import { IProcessOption } from 'impilib';
import { registerResultViewerMessages } from './report-viewer-messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let isProcessing: boolean = false;

export function registerAnonMessages() {

    ipcMain.on('background-start', (event: any, processOptions: IProcessOption) => {
        // Use options from renderer, fall back to AppSettings for missing values
        const appSettings: any = settings.get("AppSettings") || {};
        processOptions.CsvEncoding = processOptions.CsvEncoding || appSettings.CSVEncoding || 'utf8';
        processOptions.CsvSeparator = processOptions.CsvSeparator || appSettings.CSVSeparater || ';';
        processOptions.InputCsvFile = processOptions.InputCsvFile || appSettings.CSVFile || '';
        processOptions.DatabaseFile = processOptions.DatabaseFile || appSettings.DBFile || '';
        processOptions.OutputPath = processOptions.OutputPath || appSettings.OutDirectory || '';
        processOptions.SedexSenderId = processOptions.SedexSenderId || appSettings.SedexSenderId || '';
        processOptions.MappingFile = processOptions.MappingFile || appSettings.MappingFile || 'mapping.json';
        processOptions.ClientVersion = app.getVersion();

        // __dirname is app/messages/ at runtime; node_modules is at src/electron/node_modules/
        const appDir = path.join(__dirname, '..');
        const projectRoot = path.join(appDir, '..');
        const scriptPath = path.join(appDir, 'background', 'background-process.js');
        console.log('[MAIN] forking:', scriptPath, 'cwd:', projectRoot);
        const child = utilityProcess.fork(scriptPath, [], {
            cwd: projectRoot,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        child.stdout?.on('data', (data: Buffer) => console.log(`[BACKGROUND] ${data.toString().trim()}`));
        child.stderr?.on('data', (data: Buffer) => console.error(`[BACKGROUND:ERR] ${data.toString().trim()}`));

        child.on('message', (message: any) => {
            console.log('[MAIN] child message:', message.type);
            if (message.type === 'result') {
                console.log('[MAIN] processing complete, error:', !!message.payload?.Error);
                Main.GetMainWindow().webContents.send('background-response', message.payload);
                isProcessing = false;
            } else if (message.type === 'progress') {
                Main.GetMainWindow().webContents.send('background-response-row', message.payload);
            }
        });

        child.on('exit', (code: number) => {
            console.log(`[BACKGROUND] process exited with code ${code}`);
            isProcessing = false;
        });

        child.postMessage(processOptions);
        isProcessing = true;
    });

    ipcMain.on('verify db', (event: any, file: string) => {
        ValidateDatabase(file)
            .then((dbinfo) => {
                console.log('[MAIN] verify db result:', JSON.stringify(dbinfo));
                Main.GetMainWindow().webContents.send('verify db response', { dbInfo: dbinfo, err: null });
            }).catch((error) => {
                Main.GetMainWindow().webContents.send('verify db response', { dbInfo: null, err: { message: error.message } });
            });
    });

    ipcMain.on('verify csv', (event: any, payload: { file: string, delimiter: string }) => {
        ValidateInputCsv(payload.file, payload.delimiter)
            .then((count) => {
                Main.GetMainWindow().webContents.send('verify csv response', { rowcount: count, err: null });
            }).catch((error: Error) => {
                Main.GetMainWindow().webContents.send('verify csv response', { rowcount: 0, err: { message: error.message } });
            });
    });

    ipcMain.on('verify path', (event: any, path: string) => {
        ValidateOutputDir(path).then((valid) => {
            Main.GetMainWindow().webContents.send('verify path response', valid);
        })
    });

    ipcMain.on('select-file', async (event: any, filters: any[]) => {
        const result = await dialog.showOpenDialog(Main.GetMainWindow(), {
            properties: ['openFile'],
            filters: filters || []
        });
        Main.GetMainWindow().webContents.send('select-file-response', result.canceled ? null : result.filePaths[0]);
    });

    ipcMain.on('select-directory', async () => {
        const result = await dialog.showOpenDialog(Main.GetMainWindow(), {
            properties: ['openDirectory']
        });
        Main.GetMainWindow().webContents.send('select-directory-response', result.canceled ? null : result.filePaths[0]);
    });

    ipcMain.on('set-setting', (event: any, payload: { key: string, value: any }) => {
        let appSettings: any = settings.get("AppSettings") || {};
        appSettings[payload.key] = payload.value;
        settings.set("AppSettings", appSettings);
    });

    ipcMain.on('checkkfactor', (event: any, file: string) => {
        CheckKFactor(file).then((check) => {
            Main.GetMainWindow().webContents.send('checkkfactor response', { check: check, err: null });
        }).catch((error) => {
            Main.GetMainWindow().webContents.send('checkkfactor response', { check: null, err: { message: error.message } });
        });
    });
}
