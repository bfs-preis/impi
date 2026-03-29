import { Injectable } from '@angular/core';
import { ILogResult } from '../models';

declare const electron: any;

@Injectable()
export class ProcessResultService {

  private get ipcRenderer() {
    return electron?.ipcRenderer;
  }

  GetProcessResult(): Promise<ILogResult | null> {
    return new Promise(resolve => {
      this.ipcRenderer.send('ask-for-process-result', null);
      this.ipcRenderer.once('process-result', (_event: any, payload: ILogResult | null) => {
        resolve(payload);
      });
    });
  }

  GetShowAllValidationErrors(): Promise<boolean> {
    return new Promise(resolve => {
      this.ipcRenderer.send('ask-for-show-redflags', null);
      this.ipcRenderer.once('redflags-result', (_event: any, payload: boolean | null) => {
        resolve(payload ?? true);
      });
    });
  }
}
