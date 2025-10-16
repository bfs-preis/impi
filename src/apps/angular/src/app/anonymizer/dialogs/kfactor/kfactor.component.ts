import {Component, Inject, OnInit, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule, ObSpinnerModule, ObSpinnerService} from '@oblique/oblique';
import {ElectronService} from '../../services/electron.service';

/**
 * K-factor validation dialog
 * Tests if the database meets K-factor requirements
 */
@Component({
	selector: 'app-kfactor-dialog',
	templateUrl: './kfactor.component.html',
	styleUrls: ['./kfactor.component.scss'],
	standalone: true,
	imports: [MatDialogModule, MatIconModule, TranslateModule, ObButtonModule, MatButtonModule, ObSpinnerModule]
})
export class KfactorDialogComponent implements OnInit {
	isChecking = false;
	checkComplete = false;
	checkResult: boolean | null = null;
	error: string | null = null;

	readonly channel = 'kFactorChannel';
	private readonly spinnerService = inject(ObSpinnerService);

	constructor(
		public dialogRef: MatDialogRef<KfactorDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: {file: string},
		private readonly electronService: ElectronService
	) {}

	// eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
	ngOnInit(): void {}

	startCheck(): void {
		this.isChecking = true;
		this.checkComplete = false;
		this.error = null;
		this.spinnerService.activate(this.channel);
		this.electronService.checkKFactor(this.data.file).subscribe({
			next: result => {
				this.checkResult = result;
				this.isChecking = false;
				this.checkComplete = true;
				this.spinnerService.deactivate(this.channel);
			},
			error: err => {
				this.error = err.message || 'Error checking K-factor';
				this.isChecking = false;
				this.checkComplete = true;
				this.checkResult = false;
				this.spinnerService.deactivate(this.channel);
			}
		});
	}

	close(): void {
		this.dialogRef.close();
	}

	cancel(): void {
		this.dialogRef.close();
	}
}
