import {Observable} from 'rxjs';
import {IDbInfo} from '../models';

/**
 * File filter for file dialogs
 */
export interface FileFilter {
	name: string;
	extensions: string[];
}

/**
 * Abstract service interface for Electron functionality
 * This allows for both mock (web) and real (Electron) implementations
 */
export abstract class ElectronService {
	/**
	 * Get current theme
	 */
	abstract getTheme(): Observable<string>;

	/**
	 * Set theme
	 */
	abstract setTheme(theme: string): void;

	/**
	 * Get current language
	 */
	abstract getLanguage(): Observable<string>;

	/**
	 * Set language
	 */
	abstract setLanguage(lang: string): void;

	/**
	 * Get application version
	 */
	abstract getAppVersion(): string;

	/**
	 * Get a setting value
	 */
	abstract getSetting<T>(key: string, defaultValue?: T): T;

	/**
	 * Set a setting value
	 */
	abstract setSetting<T>(key: string, value: T): void;

	/**
	 * Open file selection dialog
	 * @param filters File type filters
	 * @returns Selected file path or null if cancelled
	 */
	abstract selectFile(filters: FileFilter[]): Observable<string | null>;

	/**
	 * Open directory selection dialog
	 * @returns Selected directory path or null if cancelled
	 */
	abstract selectDirectory(): Observable<string | null>;

	/**
	 * Verify database file and extract metadata
	 * @param file Path to database file
	 * @returns Database information or error
	 */
	abstract verifyDatabase(file: string): Observable<IDbInfo>;

	/**
	 * Verify CSV file and count rows
	 * @param file Path to CSV file
	 * @param delimiter CSV delimiter
	 * @returns Number of rows or error
	 */
	abstract verifyCsv(file: string, delimiter: string): Observable<number>;

	/**
	 * Verify that a path exists and is writable
	 * @param path Directory path
	 * @returns True if valid
	 */
	abstract verifyPath(path: string): Observable<boolean>;

	/**
	 * Check K-factor for database
	 * @param file Path to database file
	 * @returns True if valid
	 */
	abstract checkKFactor(file: string): Observable<boolean>;

	/**
	 * Log a message
	 */
	abstract log(level: 'info' | 'warn' | 'error', message: string): void;
}
