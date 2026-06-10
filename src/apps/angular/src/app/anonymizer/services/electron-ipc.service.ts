import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {ElectronService, FileFilter} from './electron.service';
import {IDbInfo} from '../models';

interface IpcRenderer {
	send(channel: string, ...args: unknown[]): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	once(channel: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(channel: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	removeListener?(channel: string, listener: (...args: any[]) => void): void;
}

interface IpcError {
	message: string;
}

function getIpc(): IpcRenderer | undefined {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const win = window as any;
	return win.electron?.ipcRenderer as IpcRenderer | undefined;
}

@Injectable()
export class ElectronIpcService extends ElectronService {

	private get ipc(): IpcRenderer | undefined {
		return getIpc();
	}

	getAppVersion(): string {
		return '1.5.2';
	}

	getSetting<T>(key: string, defaultValue?: T): T {
		// Settings are stored via IPC, use sync request pattern
		const stored = localStorage.getItem(`impi_${key}`);
		if (stored !== null) {
			try { return JSON.parse(stored); } catch { return stored as unknown as T; }
		}
		return defaultValue as T;
	}

	setSetting<T>(key: string, value: T): void {
		localStorage.setItem(`impi_${key}`, JSON.stringify(value));
		if (this.ipc) {
			this.ipc.send('set-setting', {key, value});
		}
	}

	selectFile(filters: FileFilter[]): Observable<string | null> {
		return new Observable(observer => {
			if (!this.ipc) {
				observer.next(null);
				observer.complete();
				return;
			}
			this.ipc.once('select-file-response', (path: string | null) => {
				observer.next(path);
				observer.complete();
			});
			this.ipc.send('select-file', filters);
		});
	}

	selectDirectory(): Observable<string | null> {
		return new Observable(observer => {
			if (!this.ipc) {
				observer.next(null);
				observer.complete();
				return;
			}
			this.ipc.once('select-directory-response', (path: string | null) => {
				observer.next(path);
				observer.complete();
			});
			this.ipc.send('select-directory');
		});
	}

	verifyDatabase(file: string): Observable<IDbInfo> {
		return new Observable(observer => {
			if (!this.ipc) {
				observer.error(new Error('Not in Electron'));
				return;
			}
			this.ipc.once('verify db response', (payload: {dbInfo: IDbInfo | null; err: IpcError | null}) => {
				if (payload.err) {
					observer.error(new Error(payload.err.message));
				} else if (payload.dbInfo) {
					observer.next(payload.dbInfo);
					observer.complete();
				}
			});
			this.ipc.send('verify db', file);
		});
	}

	verifyCsv(file: string, delimiter: string): Observable<number> {
		return new Observable(observer => {
			if (!this.ipc) {
				observer.error(new Error('Not in Electron'));
				return;
			}
			this.ipc.once('verify csv response', (payload: {rowcount: number; err: IpcError | null}) => {
				if (payload.err) {
					observer.error(new Error(payload.err.message));
				} else {
					observer.next(payload.rowcount);
					observer.complete();
				}
			});
			this.ipc.send('verify csv', {file, delimiter});
		});
	}

	verifyPath(path: string): Observable<boolean> {
		return new Observable(observer => {
			if (!this.ipc) {
				observer.next(false);
				observer.complete();
				return;
			}
			this.ipc.once('verify path response', (valid: boolean) => {
				observer.next(valid);
				observer.complete();
			});
			this.ipc.send('verify path', path);
		});
	}

	checkKFactor(file: string): Observable<boolean> {
		return new Observable(observer => {
			if (!this.ipc) {
				observer.error(new Error('Not in Electron'));
				return;
			}
			this.ipc.once('checkkfactor response', (payload: {check: boolean | null; err: IpcError | null}) => {
				if (payload.err) {
					observer.error(new Error(payload.err.message));
				} else {
					observer.next(payload.check ?? false);
					observer.complete();
				}
			});
			this.ipc.send('checkkfactor', file);
		});
	}

	setTheme(_theme: string): void {}
	setLanguage(_lang: string): void {}
	getTheme(): Observable<string> { return new BehaviorSubject('Light').asObservable(); }
	getLanguage(): Observable<string> { return new BehaviorSubject('de').asObservable(); }

	log(level: 'info' | 'warn' | 'error', message: string): void {
		console[level](`[IMPI] ${message}`);
	}
}
