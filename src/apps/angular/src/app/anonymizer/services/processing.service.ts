import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ILogResult, IProcessOption, ProcessProgress} from '../models';

interface IpcRenderer {
	send(channel: string, ...args: unknown[]): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	once(channel: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(channel: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	removeListener?(channel: string, listener: (...args: any[]) => void): void;
}

function getIpc(): IpcRenderer | undefined {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const win = window as any;
	return win.electron?.ipcRenderer as IpcRenderer | undefined;
}

@Injectable()
export class ProcessingService {

	processWithResult(options: IProcessOption, onProgress: (progress: ProcessProgress) => void): Observable<ILogResult> {
		const ipc = getIpc();
		return ipc
			? this.processViaIpc(options, onProgress, ipc)
			: this.processMock(options, onProgress);
	}

	private processViaIpc(options: IProcessOption, onProgress: (progress: ProcessProgress) => void, ipc: IpcRenderer): Observable<ILogResult> {
		return new Observable(observer => {
			const progressHandler = (progress: {processedRow: number; maxRows: number}) => {
				onProgress({
					processedRow: progress.processedRow,
					maxRows: progress.maxRows,
					percentage: (progress.processedRow / progress.maxRows) * 100
				});
			};

			const resultHandler = (result: ILogResult) => {
				ipc.removeListener?.('background-response-row', progressHandler);
				observer.next(result);
				observer.complete();
			};

			ipc.on('background-response-row', progressHandler);
			ipc.once('background-response', resultHandler);
			ipc.send('background-start', options);

			// Teardown: clean up listeners and kill background process on unsubscribe (cancel)
			return () => {
				ipc.removeListener?.('background-response-row', progressHandler);
				ipc.removeListener?.('background-response', resultHandler);
				ipc.send('background-cancel');
			};
		});
	}

	private processMock(options: IProcessOption, onProgress: (progress: ProcessProgress) => void): Observable<ILogResult> {
		return new Observable(observer => {
			const maxRows = options.CsvRowCount || 100;
			let row = 0;
			const timer = setInterval(() => {
				row++;
				onProgress({processedRow: row, maxRows, percentage: (row / maxRows) * 100});
				if (row >= maxRows) {
					clearInterval(timer);
					observer.next({Success: true, ProcessedRows: maxRows, Duration: row * 50} as ILogResult);
					observer.complete();
				}
			}, 50);

			// Teardown: stop interval on unsubscribe (cancel)
			return () => clearInterval(timer);
		});
	}
}
