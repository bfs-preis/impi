import { Injectable } from '@angular/core';

import { IDbInfo } from 'impilib';

declare var electron: any;
const ipcRenderer = electron.ipcRenderer;

@Injectable()
export class ElectronService {

  constructor() {

  }

  getTheme(): string {
    return electron.remote.require('electron-settings').get('AppSettings.Theme');
  }

  getAppVersion(): string {
    return electron.remote.app.getVersion();
  }

  getLanguage(): string {
    return electron.remote.require('electron-settings').get('AppSettings.Language');
  }

  getSettings(): any {
    return electron.remote.require('electron-settings');
  }

  getRemote(): any {
    return electron.remote;
  }

  getIPCRenderer(): any {
    return ipcRenderer;
  }

  getLog(): any {
    return electron.remote.require('electron-log');
  }

  OnBackgroundResponseRow(callback: (event: any, progress: { processedRow: number, maxRows: number }) => void) {
    ipcRenderer.on('background-response-row', callback);
  }

  VerifyDatabase(file: string, callback: (dbInfo: IDbInfo, err: Error) => void) {
    ipcRenderer.send("verify db", file);
    ipcRenderer.once("verify db response", (event: any, payload: any) => {
      this.getLog().info(payload);
      callback(payload.dbInfo, payload.err);
    });
  }

  VerifyCsv(option: { file: string, delimiter: string }, callback: (rows: number, err: Error) => void) {
    ipcRenderer.send("verify csv", option);
    ipcRenderer.once("verify csv response", (event: any, payload: any) => {
      this.getLog().info(JSON.stringify(payload));
      callback(payload.rowcount, payload.err);
    });
  }

  VerifyPath(path: string, callback: (valid: boolean) => void) {
    ipcRenderer.send("verify path", path);
    ipcRenderer.once("verify path response", (event: any, payload: any) => {
      this.getLog().info(JSON.stringify(payload));
      callback(payload);
    });
  }
}
