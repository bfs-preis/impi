import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObAlertModule, ObButtonModule, ObSpinnerModule} from '@oblique/oblique';
import {ElectronService, FileFilter} from '../../services/electron.service';
import {IDbInfo} from '../../models';
import {KfactorDialogComponent} from '../../dialogs/kfactor/kfactor.component';
import {FilePickerComponent} from '../shared/file-picker/file-picker.component';

/**
 * Database file selector component
 * Validates SQLite database and displays metadata
 */
@Component({
	selector: 'app-db-selector',
	templateUrl: './db-selector.component.html',
	styleUrls: ['./db-selector.component.scss'],
	standalone: true,
	imports: [MatIconModule, TranslateModule, ObAlertModule, ObButtonModule, ObSpinnerModule, FilePickerComponent, MatButtonModule, MatTooltipModule, MatCardModule]
})
export class DbSelectorComponent implements OnInit {
	@Input() disabled = false;
	@Output() readonly isValid = new EventEmitter<boolean>();

	file: string | null = null;
	dbInfo: IDbInfo | null = null;
	isValidFile = false;
	isValidating = false;
	error: string | null = null;

	filters: FileFilter[] = [
		{name: 'Database', extensions: ['db']},
		{name: 'All Files', extensions: ['*']}
	];

	constructor(
		private readonly electronService: ElectronService,
		private readonly dialog: MatDialog,
		private readonly translate: TranslateService
	) {}

	ngOnInit(): void {
		// Load previously selected file
		const savedFile = this.electronService.getSetting<string>('DBFile');
		if (savedFile) {
			this.file = savedFile;
			this.verifyFile();
		}
	}

	onFileSelected(file: string): void {
		this.file = file;
		this.verifyFile();
		// Save to settings
		this.electronService.setSetting('DBFile', file);
	}

	verifyFile(): void {
		if (!this.file) {
			this.isValidFile = false;
			this.isValid.emit(false);
			return;
		}

		this.isValidating = true;
		this.error = null;

		this.electronService.verifyDatabase(this.file).subscribe({
			next: dbInfo => {
				// Normalize dates — IPC may serialize Date objects as ISO strings
				dbInfo.PeriodFrom = new Date(dbInfo.PeriodFrom).getTime();
				dbInfo.PeriodTo = new Date(dbInfo.PeriodTo).getTime();
				this.dbInfo = dbInfo;
				this.isValidFile = true;
				this.error = null;
				this.isValidating = false;
				this.isValid.emit(true);
			},
			error: err => {
				this.dbInfo = null;
				this.isValidFile = false;
				this.error = err.message || 'Invalid database file';
				this.isValidating = false;
				this.isValid.emit(false);
			}
		});
	}

	getVersion(): string {
		return this.dbInfo?.Version || '';
	}

	getPeriod(): string {
		if (!this.dbInfo) {
			return '';
		}
		const from = new Date(this.dbInfo.PeriodFrom).toLocaleDateString('de-CH');
		const to = new Date(this.dbInfo.PeriodTo).toLocaleDateString('de-CH');
		return `${from} - ${to}`;
	}

	getKFactorTooltip(): string {
		return this.translate.instant('anonymizer.Db.KFactor');
	}

	openKFactorDialog(): void {
		if (!this.file) {
			return;
		}

		this.dialog.open(KfactorDialogComponent, {
			width: '600px',
			disableClose: true,
			data: {
				file: this.file
			}
		});
	}
}
