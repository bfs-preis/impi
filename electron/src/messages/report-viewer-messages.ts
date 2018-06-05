import { ipcMain, BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import * as log from 'electron-log';
import { Main } from '../index';

import { readResultZipFile, IProcessResult } from 'impilib';
import { CommandLineCommand, ICommandLine } from '../cmd-line/command-line';

export function registerResultViewerMessages() {
    ipcMain.on('ask-for-process-result', (event: any, result: null) => {

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
            log.debug('send process-result:' + JSON.stringify(result));
            event.sender.send('process-result', result);
        });
    });
}