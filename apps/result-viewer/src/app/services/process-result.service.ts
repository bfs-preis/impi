import { Injectable } from '@angular/core';

import { ILogResult } from 'impilib';

declare var electron: any;
const ipcRenderer = electron.ipcRenderer;

@Injectable()
export class ProcessResultService {

  constructor() {

  }

  GetProcessResult(): Promise<ILogResult | null> {
    return new Promise(resolve => {
      ipcRenderer.send("ask-for-process-result", null);
      ipcRenderer.once("process-result", (event: any, payload: ILogResult | null) => {
        resolve(payload);
      });
    });
  }

  GetShowAllValidationErrors(): Promise<boolean> {
    return new Promise(resolve => {
      ipcRenderer.send("ask-for-show-redflags", null);
      ipcRenderer.once("redflags-result", (event: any, payload: boolean | null) => {
        resolve(payload);
      });
    });
  }
}
