import { Injectable } from '@angular/core';
import { ILogResult } from '../models';

@Injectable()
export class ProcessResultService {

  GetProcessResult(): Promise<ILogResult | null> {
    const stored = localStorage.getItem('impi_lastResult');
    if (stored) {
      try {
        return Promise.resolve(JSON.parse(stored) as ILogResult);
      } catch {
        return Promise.resolve(null);
      }
    }
    return Promise.resolve(null);
  }

  GetShowAllValidationErrors(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
