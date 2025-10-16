import {Component, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import * as moment from 'moment';

import {DbSelectorComponent} from '../db-selector/db-selector.component';
import {CsvSelectorComponent} from '../csv-selector/csv-selector.component';
import {OutputSelectorComponent} from '../output-selector/output-selector.component';
import {SettingsDialogComponent} from '../../dialogs/settings/settings.component';
import {HelpDialogComponent} from '../../dialogs/help/help.component';

import {ElectronService} from '../../services/electron.service';
import {ProcessingService} from '../../services/processing.service';
import {ILogResult, IProcessOption, ProcessProgress} from '../../models';

/**
 * Main anonymizer component
 * Orchestrates the 3-step workflow and processing
 */
@Component({
	selector: 'app-anonymizer-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss'],
	standalone: true,
	imports: [
		MatIconModule,
		MatButtonModule,
		MatProgressBarModule,
		TranslateModule,
		ObButtonModule,
		DbSelectorComponent,
		CsvSelectorComponent,
		OutputSelectorComponent
	]
})
export class MainComponent {
	@ViewChild(DbSelectorComponent) dbSelector!: DbSelectorComponent;
	@ViewChild(CsvSelectorComponent) csvSelector!: CsvSelectorComponent;
	@ViewChild(OutputSelectorComponent) outputSelector!: OutputSelectorComponent;

	// Validation state for 3 steps
	validationState = [false, false, false];

	// Processing state
	isProcessing = false;
	processingTime = 0;
	processedRows = 0;
	maxRows = 0;
	eta = 0;
	error: string | null = null;

	private startTime = 0;
	private timerInterval: any;

	constructor(
		private readonly dialog: MatDialog,
		private readonly translate: TranslateService,
		private readonly electronService: ElectronService,
		private readonly processingService: ProcessingService
	) {}

	setState(index: number, isValid: boolean): void {
		this.validationState[index] = isValid;
	}

	onRowCountChange(count: number): void {
		this.maxRows = count;
	}

	allValid(): boolean {
		return this.validationState.every(state => state);
	}

	// eslint-disable-next-line max-lines-per-function
	process(): void {
		if (!this.allValid() || this.isProcessing || !this.dbSelector.dbInfo) {
			return;
		}

		this.isProcessing = true;
		this.error = null;
		this.processedRows = 0;
		this.processingTime = 0;
		this.eta = 0;
		this.startTime = Date.now();

		// Start timer
		this.timerInterval = setInterval(() => {
			this.processingTime = Date.now() - this.startTime;
		}, 1000);

		// Build processing options
		const options: IProcessOption = {
			DbVersion: this.dbSelector.dbInfo.Version,
			DbPeriodFrom: this.dbSelector.dbInfo.PeriodFrom,
			DbPeriodTo: this.dbSelector.dbInfo.PeriodTo,
			CsvRowCount: this.csvSelector.rowCount,
			CsvEncoding: this.electronService.getSetting('CSVEncoding', 'utf8'),
			CsvSeparator: this.electronService.getSetting('CSVSeparater', ';'),
			DatabaseFile: this.dbSelector.file || '',
			InputCsvFile: this.csvSelector.file || '',
			OutputPath: this.outputSelector.path || '',
			SedexSenderId: this.electronService.getSetting('SedexSenderId', ''),
			MappingFile: '',
			ClientVersion: this.electronService.getAppVersion()
		};

		// Process with progress tracking
		this.processingService
			.processWithResult(options, (progress: ProcessProgress) => {
				this.processedRows = progress.processedRow;
				this.maxRows = progress.maxRows;

				// Calculate ETA
				const timePerRow = this.processingTime / progress.processedRow;
				const remainingRows = progress.maxRows - progress.processedRow;
				this.eta = timePerRow * remainingRows;
			})
			.subscribe({
				next: (result: ILogResult) => {
					this.handleProcessingComplete(result);
				},
				error: err => {
					this.handleProcessingError(err);
				}
			});
	}

	getProgressValue(): number {
		if (this.maxRows === 0) {
			return 0;
		}
		return (this.processedRows / this.maxRows) * 100;
	}

	getFormattedTime(): string {
		return moment.utc(moment.duration(this.processingTime).asMilliseconds()).format('HH:mm:ss');
	}

	getFormattedEta(): string {
		return moment.utc(moment.duration(this.eta).asMilliseconds()).format('HH:mm:ss');
	}

	openSettingsDialog(): void {
		const dialogRef = this.dialog.open(SettingsDialogComponent, {
			width: '600px',
			height: '500px'
		});

		dialogRef.afterClosed().subscribe(() => {
			// Re-verify files if settings changed
			if (this.csvSelector.file) {
				this.csvSelector.verifyFile();
			}
		});
	}

	openHelpDialog(): void {
		this.dialog.open(HelpDialogComponent);
	}

	private handleProcessingComplete(result: ILogResult): void {
		clearInterval(this.timerInterval);
		this.isProcessing = false;

		if (result.Error) {
			this.error = result.Error.message;
			this.showNotification(this.translate.instant('anonymizer.Main.Error'), result.Error.message);
		} else {
			this.showNotification(
				this.translate.instant('anonymizer.Main.Finished'),
				`${this.translate.instant('anonymizer.Main.Duration')} ${this.getFormattedTime()}`
			);
		}
	}

	private handleProcessingError(err: Error): void {
		clearInterval(this.timerInterval);
		this.isProcessing = false;
		this.error = err.message || 'Processing error';
		this.showNotification(this.translate.instant('anonymizer.Main.Error'), this.error || 'Unknown error');
	}

	private showNotification(title: string, message: string): void {
		// In browser, use native notifications if available
		const errorMessage = message || 'Unknown error';
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification(title, {body: errorMessage});
		} else if ('Notification' in window && Notification.permission !== 'denied') {
			void Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					new Notification(title, {body: errorMessage});
				}
			});
		}
	}
}
