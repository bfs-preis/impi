import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {delay} from 'rxjs/operators';
import {ElectronService, FileFilter} from './electron.service';
import {MockStorageService} from './mock-storage.service';
import {IDbInfo} from '../models';

/**
 * Mock implementation of ElectronService for web-based usage
 * Uses HTML5 File API and localStorage for persistence
 */
@Injectable()
export class ElectronMockService extends ElectronService {
	private readonly theme$ = new BehaviorSubject<string>('Light');
	private readonly language$ = new BehaviorSubject<string>('de');

	constructor(private readonly storage: MockStorageService) {
		super();
		// Load persisted settings
		this.theme$.next(this.storage.getSetting('Theme', 'Light'));
		this.language$.next(this.storage.getSetting('Language', 'de'));
	}

	getTheme(): Observable<string> {
		return this.theme$.asObservable();
	}

	setTheme(theme: string): void {
		this.theme$.next(theme);
		this.storage.setSetting('Theme', theme);
	}

	getLanguage(): Observable<string> {
		return this.language$.asObservable();
	}

	setLanguage(lang: string): void {
		this.language$.next(lang);
		this.storage.setSetting('Language', lang);
	}

	getAppVersion(): string {
		return '2.0.0-web';
	}

	getSetting<T>(key: string, defaultValue?: T): T {
		return this.storage.getSetting(key, defaultValue as T);
	}

	setSetting<T>(key: string, value: T): void {
		this.storage.setSetting(key, value);
	}

	selectFile(filters: FileFilter[]): Observable<string | null> {
		return new Observable(observer => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = this.filtersToAccept(filters);
			input.style.display = 'none';

			input.onchange = () => {
				if (input.files && input.files[0]) {
					const file = input.files[0];
					const mockPath = `/mock/${file.name}`;
					this.storage.storeFile(mockPath, file);
					observer.next(mockPath);
				} else {
					observer.next(null);
				}
				observer.complete();
				document.body.removeChild(input);
			};

			input.oncancel = () => {
				observer.next(null);
				observer.complete();
				document.body.removeChild(input);
			};

			document.body.appendChild(input);
			input.click();
		});
	}

	selectDirectory(): Observable<string | null> {
		return new Observable(observer => {
			// HTML5 doesn't support directory selection in all browsers
			// We'll simulate it with a simple prompt
			const path = prompt('Enter output directory path (mock):');
			if (path) {
				this.storage.setSetting('LastDirectory', path);
				observer.next(path);
			} else {
				observer.next(null);
			}
			observer.complete();
		});
	}

	verifyDatabase(file: string): Observable<IDbInfo> {
		// Simulate async validation with delay
		if (!file || !this.storage.hasFile(file)) {
			return throwError(() => new Error('Database file not found')).pipe(delay(300));
		}

		// Mock database info
		const mockDbInfo: IDbInfo = {
			Version: '1.5.2',
			PeriodFrom: new Date('2024-01-01').valueOf(),
			PeriodTo: new Date('2024-12-31').valueOf()
		};

		return of(mockDbInfo).pipe(delay(500));
	}

	verifyCsv(file: string, delimiter: string): Observable<number> {
		if (!file || !this.storage.hasFile(file)) {
			return throwError(() => new Error('CSV file not found')).pipe(delay(300));
		}

		// In a real implementation, we would parse the CSV here
		// For mock, we'll count lines
		return new Observable<number>(observer => {
			this.storage
				.readFileAsText(file)
				.then(content => {
					const lines = content.split('\n').filter(line => line.trim().length > 0);
					const rowCount = Math.max(0, lines.length - 1); // Subtract header
					observer.next(rowCount);
					observer.complete();
				})
				.catch(error => {
					observer.error(error);
				});
		}).pipe(delay(400));
	}

	verifyPath(path: string): Observable<boolean> {
		// In mock mode, we accept any non-empty path
		const isValid = !!(path && path.trim().length > 0);
		return of(isValid).pipe(delay(200));
	}

	checkKFactor(file: string): Observable<boolean> {
		if (!file || !this.storage.hasFile(file)) {
			return throwError(() => new Error('Database file not found')).pipe(delay(300));
		}

		// Mock K-factor check - always returns true for now
		return of(true).pipe(delay(6000));
	}

	log(level: 'info' | 'warn' | 'error', message: string): void {
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

		switch (level) {
			case 'info':
				console.log(logMessage);
				break;
			case 'warn':
				console.warn(logMessage);
				break;
			case 'error':
				console.error(logMessage);
				break;
		}
	}

	/**
	 * Convert file filters to HTML accept attribute
	 */
	private filtersToAccept(filters: FileFilter[]): string {
		if (filters?.length === 0) {
			return '*/*';
		}

		return filters.flatMap(filter => filter.extensions.map(ext => (ext === '*' ? '*/*' : `.${ext}`))).join(',');
	}
}
