import {ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {TranslateModule} from '@ngx-translate/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ElectronService} from '../../services/electron.service';
import {FilePickerComponent} from '../shared/file-picker/file-picker.component';

/**
 * Output directory selector component
 * Validates output path is writable
 */
@Component({
	selector: 'app-output-selector',
	templateUrl: './output-selector.component.html',
	styleUrls: ['./output-selector.component.scss'],
	standalone: true,
	imports: [MatIconModule, MatTooltipModule, TranslateModule, FilePickerComponent, MatCardModule],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutputSelectorComponent implements OnInit {
	private readonly destroyRef = inject(DestroyRef);
	@Input() disabled = false;
	@Output() isValid = new EventEmitter<boolean>();

	path: string | null = null;
	isValidPath = false;
	isValidating = false;

	constructor(private readonly electronService: ElectronService) {}

	ngOnInit(): void {
		// Load previously selected path
		const savedPath = this.electronService.getSetting<string>('OutDirectory');
		if (savedPath) {
			this.path = savedPath;
			this.verifyPath();
		}
	}

	onPathSelected(path: string): void {
		this.path = path;
		this.verifyPath();
		// Save to settings
		this.electronService.setSetting('OutDirectory', path);
	}

	verifyPath(): void {
		if (!this.path) {
			this.isValidPath = false;
			this.isValid.emit(false);
			return;
		}

		this.isValidating = true;

		this.electronService.verifyPath(this.path).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: valid => {
				this.isValidPath = valid;
				this.isValidating = false;
				this.isValid.emit(valid);
			},
			error: () => {
				this.isValidPath = false;
				this.isValidating = false;
				this.isValid.emit(false);
			}
		});
	}

	getCardClass(): string {
		if (this.isValidating) return 'card-validating';
		if (this.isValidPath) return 'card-valid';
		if (this.path && !this.isValidPath) return 'card-error';
		return '';
	}

	getCardTooltip(): string {
		if (this.isValidating) return 'Validating...';
		if (this.isValidPath) return this.path || '';
		if (this.path && !this.isValidPath) return 'Invalid directory';
		return '';
	}

	getShortPath(): string {
		if (!this.path) {
			return '';
		}
		// Truncate long paths
		if (this.path.length > 50) {
			return `...${this.path.substring(this.path.length - 47)}`;
		}
		return this.path;
	}
}
