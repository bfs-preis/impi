import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {HelpDialogComponent} from './anonymizer/dialogs/help/help.component';
import {SettingsDialogComponent} from './anonymizer/dialogs/settings/settings.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	standalone: false,
	styleUrl: './app.component.scss'
})
export class AppComponent {
	constructor(private dialog: MatDialog, private translate: TranslateService) {
		translate.setDefaultLang('de');
		translate.use('de');
	}

	openHelpDialog(): void {
		this.dialog.open(HelpDialogComponent);
	}

	openSettingsDialog(): void {
		this.dialog.open(SettingsDialogComponent, {
			width: '560px',
			autoFocus: false
		});
	}
}
