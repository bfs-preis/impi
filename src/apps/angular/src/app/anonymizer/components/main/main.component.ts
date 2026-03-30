import {Component, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';

import {DbSelectorComponent} from '../db-selector/db-selector.component';
import {CsvSelectorComponent} from '../csv-selector/csv-selector.component';
import {OutputSelectorComponent} from '../output-selector/output-selector.component';
import {ProcessingDialogComponent} from '../../dialogs/processing/processing-dialog.component';

import {ElectronService} from '../../services/electron.service';
import {IProcessOption} from '../../models';

@Component({
	selector: 'app-anonymizer-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss'],
	standalone: true,
	imports: [
		MatIconModule,
		MatButtonModule,
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

	validationState = [false, false, false];

	constructor(
		private readonly dialog: MatDialog,
		private readonly electronService: ElectronService
	) {}

	setState(index: number, isValid: boolean): void {
		this.validationState[index] = isValid;
	}

	allValid(): boolean {
		return this.validationState.every(state => state);
	}

	openProcessingDialog(): void {
		if (!this.allValid() || !this.dbSelector.dbInfo) return;

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
			MappingFile: this.electronService.getSetting('MappingFile', 'mapping.json'),
			ClientVersion: this.electronService.getAppVersion()
		};

		this.dialog.open(ProcessingDialogComponent, {
			width: '550px',
			disableClose: true,
			data: options
		});
	}
}
