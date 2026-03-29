import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {FilePickerComponent} from './file-picker.component';
import {ElectronService} from '../../../services/electron.service';

describe('FilePickerComponent', () => {
	let component: FilePickerComponent;
	let fixture: ComponentFixture<FilePickerComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', ['selectFile', 'selectDirectory']);
		electronServiceSpy.selectFile.and.returnValue(of('/mock/selected-file.csv'));
		electronServiceSpy.selectDirectory.and.returnValue(of('/mock/selected-dir'));

		await TestBed.configureTestingModule({
			imports: [
				FilePickerComponent,
				NoopAnimationsModule
			],
			providers: [{provide: ElectronService, useValue: electronServiceSpy}]
		}).compileComponents();

		fixture = TestBed.createComponent(FilePickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have default mode as file', () => {
		expect(component.mode).toBe('file');
	});

	it('should not select file when disabled', () => {
		component.disabled = true;
		component.selectFile();
		expect(electronServiceSpy.selectFile).not.toHaveBeenCalled();
		expect(electronServiceSpy.selectDirectory).not.toHaveBeenCalled();
	});

	it('should call selectFile for file mode', () => {
		spyOn(component.fileSelected, 'emit');
		component.mode = 'file';
		component.selectFile();
		expect(electronServiceSpy.selectFile).toHaveBeenCalled();
		expect(component.fileSelected.emit).toHaveBeenCalledWith('/mock/selected-file.csv');
	});

	it('should call selectDirectory for directory mode', () => {
		spyOn(component.fileSelected, 'emit');
		component.mode = 'directory';
		component.selectFile();
		expect(electronServiceSpy.selectDirectory).toHaveBeenCalled();
		expect(component.fileSelected.emit).toHaveBeenCalledWith('/mock/selected-dir');
	});

	it('should return empty string for file name when no path', () => {
		component.selectedPath = null;
		expect(component.getFileName()).toBe('');
	});

	it('should extract file name from path', () => {
		component.selectedPath = '/some/path/file.csv';
		expect(component.getFileName()).toBe('file.csv');
	});

	it('should return empty string for short path when no path', () => {
		component.selectedPath = null;
		expect(component.getShortPath()).toBe('');
	});

	it('should return full path when short enough', () => {
		component.selectedPath = '/short/path.csv';
		expect(component.getShortPath()).toBe('/short/path.csv');
	});

	it('should return file icon for file mode', () => {
		component.mode = 'file';
		expect(component.getIcon()).toBe('file');
	});

	it('should return folder icon for directory mode', () => {
		component.mode = 'directory';
		expect(component.getIcon()).toBe('folder');
	});
});
