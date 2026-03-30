import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ElectronService} from '../../services/electron.service';

/**
 * Settings dialog component
 * Allows configuration of CSV encoding, separator, theme, language, and Sedex ID
 */
@Component({
	selector: 'app-settings-dialog',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	standalone: false
})
export class SettingsDialogComponent {
	selectedEncoding: string;
	selectedSeparator: string;
	selectedSedexSenderId: string;

	encodings = ['utf8', 'windows1252', 'iso88591', 'macintosh'];
	separators = [
		{value: ';', label: '; (Semicolon)'},
		{value: ',', label: ', (Comma)'},
		{value: '\t', label: '\\t (Tab)'},
		{value: '|', label: '| (Pipe)'}
	];

	constructor(
		public dialogRef: MatDialogRef<SettingsDialogComponent>,
		private readonly electronService: ElectronService
	) {
		// Load current settings
		this.selectedEncoding = this.electronService.getSetting('CSVEncoding', 'utf8');
		this.selectedSeparator = this.electronService.getSetting('CSVSeparater', ';');
		this.selectedSedexSenderId = this.electronService.getSetting('SedexSenderId', '');
	}

	save(): void {
		this.electronService.setSetting('CSVEncoding', this.selectedEncoding);
		this.electronService.setSetting('CSVSeparater', this.selectedSeparator);
		this.electronService.setSetting('SedexSenderId', this.selectedSedexSenderId);
		this.dialogRef.close();
	}

	cancel(): void {
		this.dialogRef.close();
	}
}
