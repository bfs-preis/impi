import {TestBed} from '@angular/core/testing';
import {ProcessingService} from './processing.service';
import {IProcessOption, ProcessProgress} from '../models';

describe('ProcessingService', () => {
	let service: ProcessingService;

	const mockOptions: IProcessOption = {
		DbVersion: '1.5.2',
		DbPeriodFrom: new Date('2024-01-01').valueOf(),
		DbPeriodTo: new Date('2024-12-31').valueOf(),
		CsvRowCount: 5,
		CsvEncoding: 'utf8',
		CsvSeparator: ';',
		DatabaseFile: '/mock/test.db',
		InputCsvFile: '/mock/test.csv',
		OutputPath: '/mock/output',
		SedexSenderId: 'test-sender',
		MappingFile: '',
		ClientVersion: '2.0.0-test'
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ProcessingService]
		});
		service = TestBed.inject(ProcessingService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should call onProgress callback during processWithResult', (done: DoneFn) => {
		const progressCalls: ProcessProgress[] = [];

		service.processWithResult(mockOptions, (progress: ProcessProgress) => progressCalls.push(progress)).subscribe({
			next: result => {
				expect(result).toBeTruthy();
				expect(progressCalls.length).toBeGreaterThan(0);
				done();
			}
		});
	});
});
