import {ObButtonModule} from '@oblique/oblique';
import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {ElectronService} from '../../services/electron.service';
import {TranslateModule} from '@ngx-translate/core';
/**
 * Help dialog component
 * Displays application information and links
 */
@Component({
	selector: 'app-help-dialog',
	templateUrl: './help.component.html',
	styleUrls: ['./help.component.scss'],
	imports: [TranslateModule, ObButtonModule, MatButtonModule, MatDialogModule, MatIconModule]
})
export class HelpDialogComponent {
	appVersion: string;

	constructor(private readonly electronService: ElectronService) {
		this.appVersion = this.electronService.getAppVersion();
	}
}
