import {Component, EventEmitter, Input, Output} from '@angular/core';

import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ObButtonModule} from '@oblique/oblique';
import {ElectronService, FileFilter} from '../../../services/electron.service';

/**
 * Reusable file picker component with Oblique styling
 * Supports both file and directory selection
 */
@Component({
	selector: 'app-file-picker',
	templateUrl: './file-picker.component.html',
	styleUrls: ['./file-picker.component.scss'],
	standalone: true,
	imports: [MatIconModule, MatButtonModule, ObButtonModule, MatTooltipModule]
})
export class FilePickerComponent {
	@Input() label = 'Select File';
	@Input() buttonText = 'Browse';
	@Input() filters: FileFilter[] = [];
	@Input() mode: 'file' | 'directory' = 'file';
	@Input() disabled = false;
	@Input() selectedPath: string | null = null;

	@Output() readonly fileSelected = new EventEmitter<string>();

	constructor(private readonly electronService: ElectronService) {}

	selectFile(): void {
		if (this.disabled) {
			return;
		}

		const observable = this.mode === 'file' ? this.electronService.selectFile(this.filters) : this.electronService.selectDirectory();

		observable.subscribe(path => {
			if (path) {
				this.selectedPath = path;
				this.fileSelected.emit(path);
			}
		});
	}

	getFileName(): string {
		if (!this.selectedPath) {
			return '';
		}
		// Extract filename from path
		return this.selectedPath.replace(/^.*[\\/]/, '');
	}

	getShortPath(): string {
		if (!this.selectedPath) {
			return '';
		}
		// Truncate long paths
		if (this.selectedPath.length > 50) {
			return `...${this.selectedPath.substring(this.selectedPath.length - 47)}`;
		}
		return this.selectedPath;
	}

	getIcon() {
		if (this.mode === 'file') {
			return 'file';
		}

		return 'folder';
	}
}
