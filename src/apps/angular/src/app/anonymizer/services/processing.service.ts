import {Injectable} from '@angular/core';
import {Observable, interval, of} from 'rxjs';
import {delay, finalize, map, switchMap, take} from 'rxjs/operators';
import {ILogResult, IProcessOption, ProcessProgress} from '../models';

/**
 * Service for handling data processing operations
 * In mock mode, simulates processing with progress updates
 */
@Injectable()
export class ProcessingService {
	/**
	 * Process data with given options
	 * Returns observable that emits progress updates
	 */
	processData(options: IProcessOption): Observable<ProcessProgress> {
		const maxRows = options.CsvRowCount;

		// Simulate processing with progress updates every 100ms
		return interval(100).pipe(
			take(maxRows),
			map(tick => ({
				processedRow: tick + 1,
				maxRows,
				percentage: ((tick + 1) / maxRows) * 100
			}))
		);
	}

	/**
	 * Get the final result after processing completes
	 */
	getProcessingResult(options: IProcessOption): Observable<ILogResult> {
		// Simulate processing time
		const processingTime = options.CsvRowCount * 100;

		return of(null).pipe(
			delay(processingTime),
			map(() => {
				// Mock successful result
				const result: ILogResult = {
					Success: true,
					ProcessedRows: options.CsvRowCount,
					Duration: processingTime
				};
				return result;
			})
		);
	}

	/**
	 * Process data and return final result with progress updates
	 * This combines both progress updates and final result
	 */
	processWithResult(options: IProcessOption, onProgress: (progress: ProcessProgress) => void): Observable<ILogResult> {
		return this.processData(options).pipe(
			finalize(() => {
				// Processing complete
			}),
			// Subscribe to progress updates
			map(progress => {
				onProgress(progress);
				return progress;
			}),
			// Wait for all progress updates to complete
			take(options.CsvRowCount),
			// Then get the final result
			switchMap(() => this.getProcessingResult(options))
		);
	}
}
