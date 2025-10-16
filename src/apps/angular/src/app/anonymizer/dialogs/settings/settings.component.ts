import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
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
export class SettingsDialogComponent implements OnInit {
	selectedEncoding: string;
	selectedSeparator: string;
	selectedTheme: string;
	selectedLanguage: string;
	selectedSedexSenderId: string;

	encodings = ['utf8', 'windows1252', 'iso88591', 'macintosh'];
	separators = [
		{value: ';', label: '; (Semicolon)'},
		{value: ',', label: ', (Comma)'},
		{value: '\t', label: '\\t (Tab)'},
		{value: '|', label: '| (Pipe)'}
	];
	themes = ['Light', 'Dark'];
	languages = [
		{code: 'en', label: 'anonymizer.Settings.LanguageEn'},
		{code: 'de', label: 'anonymizer.Settings.LanguageDe'},
		{code: 'fr', label: 'anonymizer.Settings.LanguageFr'},
		{code: 'it', label: 'anonymizer.Settings.LanguageIt'}
	];

	constructor(
		public dialogRef: MatDialogRef<SettingsDialogComponent>,
		private readonly electronService: ElectronService,
		public translate: TranslateService
	) {
		// Load current settings
		this.selectedEncoding = this.electronService.getSetting('CSVEncoding', 'utf8');
		this.selectedSeparator = this.electronService.getSetting('CSVSeparater', ';');
		this.selectedTheme = this.electronService.getSetting('Theme', 'Light');
		this.selectedLanguage = this.electronService.getSetting('Language', 'de');
		this.selectedSedexSenderId = this.electronService.getSetting('SedexSenderId', '');
	}

	ngOnInit(): void {}

	save(): void {
		// Save all settings
		this.electronService.setSetting('CSVEncoding', this.selectedEncoding);
		this.electronService.setSetting('CSVSeparater', this.selectedSeparator);
		this.electronService.setSetting('Theme', this.selectedTheme);
		this.electronService.setSetting('Language', this.selectedLanguage);
		this.electronService.setSetting('SedexSenderId', this.selectedSedexSenderId);

		// Apply theme
		this.electronService.setTheme(this.selectedTheme);

		// Apply language
		this.electronService.setLanguage(this.selectedLanguage);
		this.translate.use(this.selectedLanguage);

		this.dialogRef.close();
	}

	cancel(): void {
		this.dialogRef.close();
	}
}
