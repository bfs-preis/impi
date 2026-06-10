import {ElectronIpcService} from './electron-ipc.service';

describe('ElectronIpcService', () => {
	let service: ElectronIpcService;

	beforeEach(() => {
		localStorage.clear();
		service = new ElectronIpcService();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('should create', () => {
		expect(service).toBeTruthy();
	});

	it('should return app version', () => {
		expect(service.getAppVersion()).toBe('1.5.2');
	});

	describe('getSetting', () => {
		it('should return default value when key not in localStorage', () => {
			expect(service.getSetting('missing', 'default')).toBe('default');
		});

		it('should return stored JSON value', () => {
			localStorage.setItem('impi_testKey', JSON.stringify('stored'));
			expect(service.getSetting<string>('testKey')).toBe('stored');
		});

		it('should return stored number', () => {
			localStorage.setItem('impi_count', JSON.stringify(42));
			expect(service.getSetting<number>('count')).toBe(42);
		});

		it('should return raw string when JSON parse fails', () => {
			localStorage.setItem('impi_raw', 'not-json');
			expect(service.getSetting<string>('raw')).toBe('not-json');
		});

		it('should return stored boolean', () => {
			localStorage.setItem('impi_flag', JSON.stringify(true));
			expect(service.getSetting<boolean>('flag')).toBeTrue();
		});
	});

	describe('setSetting', () => {
		it('should store value in localStorage as JSON', () => {
			service.setSetting('myKey', 'myValue');
			expect(localStorage.getItem('impi_myKey')).toBe('"myValue"');
		});

		it('should store number values', () => {
			service.setSetting('num', 123);
			expect(JSON.parse(localStorage.getItem('impi_num')!)).toBe(123);
		});

		it('should overwrite existing value', () => {
			service.setSetting('key', 'first');
			service.setSetting('key', 'second');
			expect(service.getSetting('key')).toBe('second');
		});
	});

	describe('IPC-dependent methods (no electron)', () => {
		// Without window.electron, these should return null/false/error

		it('selectFile should emit null when no IPC', (done: DoneFn) => {
			service.selectFile([]).subscribe(result => {
				expect(result).toBeNull();
				done();
			});
		});

		it('selectDirectory should emit null when no IPC', (done: DoneFn) => {
			service.selectDirectory().subscribe(result => {
				expect(result).toBeNull();
				done();
			});
		});

		it('verifyDatabase should error when no IPC', (done: DoneFn) => {
			service.verifyDatabase('/test.db').subscribe({
				error: err => {
					expect(err.message).toBe('Not in Electron');
					done();
				}
			});
		});

		it('verifyCsv should error when no IPC', (done: DoneFn) => {
			service.verifyCsv('/test.csv', ';').subscribe({
				error: err => {
					expect(err.message).toBe('Not in Electron');
					done();
				}
			});
		});

		it('verifyPath should emit false when no IPC', (done: DoneFn) => {
			service.verifyPath('/test').subscribe(result => {
				expect(result).toBeFalse();
				done();
			});
		});

		it('checkKFactor should error when no IPC', (done: DoneFn) => {
			service.checkKFactor('/test.db').subscribe({
				error: err => {
					expect(err.message).toBe('Not in Electron');
					done();
				}
			});
		});
	});

	describe('theme and language', () => {
		it('getTheme should return observable with Light', (done: DoneFn) => {
			service.getTheme().subscribe(theme => {
				expect(theme).toBe('Light');
				done();
			});
		});

		it('getLanguage should return observable with de', (done: DoneFn) => {
			service.getLanguage().subscribe(lang => {
				expect(lang).toBe('de');
				done();
			});
		});
	});

	it('log should not throw', () => {
		expect(() => service.log('info', 'test message')).not.toThrow();
		expect(() => service.log('error', 'test error')).not.toThrow();
	});
});
