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

	it('should emit progress updates from processData', (done: DoneFn) => {
		const progressUpdates: ProcessProgress[] = [];

		service.processData(mockOptions).subscribe({
			next: progress => {
				progressUpdates.push(progress);
			},
			complete: () => {
				expect(progressUpdates.length).toBe(mockOptions.CsvRowCount);
				expect(progressUpdates[0].processedRow).toBe(1);
				expect(progressUpdates[0].maxRows).toBe(mockOptions.CsvRowCount);
				expect(progressUpdates[progressUpdates.length - 1].processedRow).toBe(mockOptions.CsvRowCount);
				done();
			}
		});
	});

	it('should return a successful result from getProcessingResult', (done: DoneFn) => {
		service.getProcessingResult(mockOptions).subscribe({
			next: result => {
				expect(result.Success).toBeTrue();
				expect(result.ProcessedRows).toBe(mockOptions.CsvRowCount);
				done();
			}
		});
	});

	it('should call onProgress callback during processWithResult', (done: DoneFn) => {
		const progressCalls: ProcessProgress[] = [];

		service.processWithResult(mockOptions, progress => progressCalls.push(progress)).subscribe({
			next: result => {
				expect(result).toBeTruthy();
				expect(result.Success).toBeTrue();
				expect(progressCalls.length).toBeGreaterThan(0);
				done();
			}
		});
	});
});
