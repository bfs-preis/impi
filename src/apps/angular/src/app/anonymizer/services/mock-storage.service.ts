import {Injectable} from '@angular/core';

/**
 * Service for storing mock file references and settings
 * Uses localStorage for persistence and Map for file references
 */
@Injectable({
	providedIn: 'root'
})
export class MockStorageService {
	private readonly fileReferences = new Map<string, File>();
	private readonly SETTINGS_PREFIX = 'impi.anonymizer.';

	/**
	 * Store a file reference for later retrieval
	 */
	storeFile(mockPath: string, file: File): void {
		this.fileReferences.set(mockPath, file);
	}

	/**
	 * Get a stored file reference
	 */
	getFile(mockPath: string): File | undefined {
		return this.fileReferences.get(mockPath);
	}

	/**
	 * Check if a file reference exists
	 */
	hasFile(mockPath: string): boolean {
		return this.fileReferences.has(mockPath);
	}

	/**
	 * Read file as text
	 */
	async readFileAsText(mockPath: string): Promise<string> {
		const file = this.getFile(mockPath);
		if (!file) {
			throw new Error(`File not found: ${mockPath}`);
		}
		return await file.text();
	}

	/**
	 * Read file as array buffer
	 */
	async readFileAsArrayBuffer(mockPath: string): Promise<ArrayBuffer> {
		const file = this.getFile(mockPath);
		if (!file) {
			throw new Error(`File not found: ${mockPath}`);
		}
		return await file.arrayBuffer();
	}

	/**
	 * Set a setting in localStorage
	 */
	setSetting(key: string, value: any): void {
		try {
			localStorage.setItem(this.SETTINGS_PREFIX + key, JSON.stringify(value));
		} catch (error) {
			console.error('Error saving setting:', error);
		}
	}

	/**
	 * Get a setting from localStorage
	 */
	getSetting<T>(key: string, defaultValue: T): T {
		try {
			const stored = localStorage.getItem(this.SETTINGS_PREFIX + key);
			return stored ? JSON.parse(stored) : defaultValue;
		} catch (error) {
			console.error('Error reading setting:', error);
			return defaultValue;
		}
	}

	/**
	 * Remove a setting
	 */
	removeSetting(key: string): void {
		localStorage.removeItem(this.SETTINGS_PREFIX + key);
	}

	/**
	 * Clear all settings
	 */
	clearSettings(): void {
		const keys = Object.keys(localStorage);
		keys.forEach(key => {
			if (key.startsWith(this.SETTINGS_PREFIX)) {
				localStorage.removeItem(key);
			}
		});
	}

	/**
	 * Get all settings as object
	 */
	getAllSettings(): Record<string, any> {
		const settings: Record<string, any> = {};
		const keys = Object.keys(localStorage);
		keys.forEach(key => {
			if (key.startsWith(this.SETTINGS_PREFIX)) {
				const settingKey = key.replace(this.SETTINGS_PREFIX, '');
				try {
					settings[settingKey] = JSON.parse(localStorage.getItem(key) || '');
				} catch {
					// Ignore parse errors
				}
			}
		});
		return settings;
	}
}
