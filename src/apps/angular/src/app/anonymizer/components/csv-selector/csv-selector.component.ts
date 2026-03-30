import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {TranslateModule} from '@ngx-translate/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ElectronService, FileFilter} from '../../services/electron.service';
import {FilePickerComponent} from '../shared/file-picker/file-picker.component';

/**
 * CSV file selector component
 * Validates CSV file and counts rows
 */
@Component({
	selector: 'app-csv-selector',
	templateUrl: './csv-selector.component.html',
	styleUrls: ['./csv-selector.component.scss'],
	standalone: true,
	imports: [MatIconModule, MatTooltipModule, TranslateModule, FilePickerComponent, MatCardModule]
})
export class CsvSelectorComponent implements OnInit {
	@Input() disabled = false;
	@Output() readonly isValid = new EventEmitter<boolean>();
	@Output() readonly rowCountChange = new EventEmitter<number>();

	file: string | null = null;
	rowCount = 0;
	isValidFile = false;
	isValidating = false;
	error: string | null = null;

	filters: FileFilter[] = [
		{name: 'CSV Files', extensions: ['csv']},
		{name: 'All Files', extensions: ['*']}
	];

	constructor(private readonly electronService: ElectronService) {}

	ngOnInit(): void {
		// Load previously selected file
		const savedFile = this.electronService.getSetting<string>('CSVFile');
		if (savedFile) {
			this.file = savedFile;
			this.verifyFile();
		}
	}

	onFileSelected(file: string): void {
		this.file = file;
		this.verifyFile();
		// Save to settings
		this.electronService.setSetting('CSVFile', file);
	}

	verifyFile(): void {
		if (!this.file) {
			this.isValidFile = false;
			this.rowCount = 0;
			this.isValid.emit(false);
			this.rowCountChange.emit(0);
			return;
		}

		this.isValidating = true;
		this.error = null;

		// Get delimiter from settings
		const delimiter = this.electronService.getSetting<string>('CSVSeparater', ';');

		this.electronService.verifyCsv(this.file, delimiter).subscribe({
			next: rows => {
				this.rowCount = rows;
				this.isValidFile = true;
				this.error = null;
				this.isValidating = false;
				this.isValid.emit(true);
				this.rowCountChange.emit(rows);
			},
			error: err => {
				this.rowCount = 0;
				this.isValidFile = false;
				this.error = err.message || 'Invalid CSV file';
				this.isValidating = false;
				this.isValid.emit(false);
				this.rowCountChange.emit(0);
			}
		});
	}

	formatRowCount(): string {
		return this.rowCount.toLocaleString();
	}

	getCardClass(): string {
		if (this.isValidating) return 'card-validating';
		if (this.isValidFile) return 'card-valid';
		if (this.error) return 'card-error';
		return '';
	}

	getCardTooltip(): string {
		if (this.isValidating) return 'Validating...';
		if (this.isValidFile) return `${this.rowCount.toLocaleString()} Zeilen`;
		if (this.error) return this.error;
		return '';
	}
}
