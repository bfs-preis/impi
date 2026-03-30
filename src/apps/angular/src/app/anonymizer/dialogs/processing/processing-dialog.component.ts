import {Component, Inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslateModule} from '@ngx-translate/core';
import {ObAlertModule, ObButtonModule, ObSpinnerModule, ObSpinnerService} from '@oblique/oblique';
import {Subscription} from 'rxjs';
import moment from 'moment';

import {ProcessingService} from '../../services/processing.service';
import {ILogResult, IProcessOption} from '../../models';

type DialogState = 'processing' | 'success' | 'error';

@Component({
	selector: 'app-processing-dialog',
	templateUrl: './processing-dialog.component.html',
	styleUrls: ['./processing-dialog.component.scss'],
	standalone: true,
	imports: [
		DecimalPipe,
		MatDialogModule,
		MatButtonModule,
		MatProgressBarModule,
		TranslateModule,
		ObAlertModule,
		ObButtonModule,
		ObSpinnerModule
	]
})
export class ProcessingDialogComponent implements OnInit, OnDestroy {
	state: DialogState = 'processing';
	processedRows = 0;
	maxRows: number;
	progressValue = 0;
	processingTime = 0;
	eta = 0;
	rowsPerSecond = 0;
	error: string | null = null;
	result: ILogResult | null = null;

	readonly spinnerChannel = 'processingDialogChannel';
	private subscription: Subscription | null = null;
	private timerInterval: ReturnType<typeof setInterval> | null = null;
	private startTime = 0;

	constructor(
		private readonly dialogRef: MatDialogRef<ProcessingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private readonly options: IProcessOption,
		private readonly processingService: ProcessingService,
		private readonly spinnerService: ObSpinnerService,
		private readonly zone: NgZone
	) {
		this.maxRows = options.CsvRowCount || 0;
	}

	ngOnInit(): void {
		this.startProcessing();
	}

	ngOnDestroy(): void {
		this.cleanup();
	}

	cancel(): void {
		this.cleanup();
		this.dialogRef.close(undefined);
	}

	close(): void {
		this.dialogRef.close(this.result);
	}

	get formattedTime(): string {
		return moment.utc(this.processingTime).format('HH:mm:ss');
	}

	get formattedEta(): string {
		return moment.utc(this.eta).format('HH:mm:ss');
	}

	private startProcessing(): void {
		this.startTime = Date.now();
		this.spinnerService.activate(this.spinnerChannel);

		this.timerInterval = setInterval(() => {
			this.processingTime = Date.now() - this.startTime;
			this.updateRowsPerSecond();
		}, 1000);

		this.subscription = this.processingService
			.processWithResult(this.options, progress => {
				this.zone.run(() => {
					this.processedRows = progress.processedRow;
					this.maxRows = progress.maxRows;
					this.progressValue = progress.percentage;
					this.updateEta();
				});
			})
			.subscribe({
				next: result => this.zone.run(() => this.onComplete(result)),
				error: err => this.zone.run(() => this.onError(err.message || 'Unknown error'))
			});
	}

	private onComplete(result: ILogResult): void {
		this.stopTimer();
		this.spinnerService.deactivate(this.spinnerChannel);
		this.result = result;

		if (result.Error) {
			this.error = result.Error.message;
			this.state = 'error';
		} else {
			this.state = 'success';
		}
		this.dialogRef.disableClose = false;
	}

	private onError(message: string): void {
		this.stopTimer();
		this.spinnerService.deactivate(this.spinnerChannel);
		this.error = message;
		this.state = 'error';
		this.dialogRef.disableClose = false;
	}

	private updateEta(): void {
		if (this.processedRows > 0) {
			const timePerRow = this.processingTime / this.processedRows;
			this.eta = timePerRow * (this.maxRows - this.processedRows);
		}
	}

	private updateRowsPerSecond(): void {
		const elapsed = this.processingTime / 1000;
		this.rowsPerSecond = elapsed > 0 ? this.processedRows / elapsed : 0;
	}

	private stopTimer(): void {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
		this.processingTime = Date.now() - this.startTime;
		this.updateRowsPerSecond();
	}

	private cleanup(): void {
		this.subscription?.unsubscribe();
		this.subscription = null;
		this.stopTimer();
		this.spinnerService.deactivate(this.spinnerChannel);
	}
}
