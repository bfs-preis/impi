import { ipcMain, BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import * as log from 'electron-log';
import { Main } from '../index';

import { readResultZipFile, IProcessResult } from 'impilib';
import { CommandLineCommand, ICommandLine } from '../cmd-line/command-line';

export function registerResultViewerMessages(results: IProcessResult | null) {
    ipcMain.on('ask-for-process-result', (event: any, result: null) => {

        if (!results) {
            let file = CommandLineCommand ? CommandLineCommand.ResultFile : null;
            if (!file || !fs.existsSync(file)) {
                let selectedObjects: string[] = dialog.showOpenDialog({
                    properties: ['openFile'], filters: [
                        { name: 'Zip Files', extensions: ['zip'] }
                    ]
                });
                if (selectedObjects == null) {
                    Main.GetResultWindow().close();
                    return;
                }
                file = selectedObjects[0];
            }
            log.debug('Result File:' + file);
            readResultZipFile(file, (result: IProcessResult) => {
                log.silly('send process-result:' + JSON.stringify(result));
                event.sender.send('process-result', result);
            });
        } else {
            log.silly('send process-result:' + JSON.stringify(results));
            event.sender.send('process-result', results);
        }
    });

    ipcMain.on('ask-for-show-redflags', (event: any, result: null) => {
        log.debug('send redflags-result:' + JSON.stringify(CommandLineCommand.AllValidationErrors));
        event.sender.send('redflags-result', CommandLineCommand.AllValidationErrors);
    });

}