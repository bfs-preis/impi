import {Component, DestroyRef, Inject, inject, NgZone, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ObAlertModule, ObButtonModule} from '@oblique/oblique';
import {ElectronService} from '../../services/electron.service';

type DialogState = 'checking' | 'success' | 'error';

@Component({
	selector: 'app-kfactor-dialog',
	templateUrl: './kfactor.component.html',
	styleUrls: ['./kfactor.component.scss'],
	standalone: true,
	imports: [MatDialogModule, MatProgressSpinnerModule, TranslateModule, ObAlertModule, ObButtonModule, MatButtonModule]
})
export class KfactorDialogComponent implements OnInit {
	state: DialogState = 'checking';
	error: string | null = null;

	private readonly destroyRef = inject(DestroyRef);
	private readonly zone = inject(NgZone);

	constructor(
		private readonly dialogRef: MatDialogRef<KfactorDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private readonly data: {file: string},
		private readonly electronService: ElectronService
	) {}

	ngOnInit(): void {
		this.startCheck();
	}

	close(): void {
		this.dialogRef.close();
	}

	cancel(): void {
		this.dialogRef.close();
	}

	private startCheck(): void {
		this.dialogRef.disableClose = true;

		this.electronService.checkKFactor(this.data.file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: result => {
				this.zone.run(() => {
					this.state = result ? 'success' : 'error';
					this.dialogRef.disableClose = false;
				});
			},
			error: err => {
				this.zone.run(() => {
					this.error = err.message || 'Error checking K-factor';
					this.state = 'error';
					this.dialogRef.disableClose = false;
				});
			}
		});
	}
}
