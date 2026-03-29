import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {MainComponent} from './main.component';
import {ElectronService} from '../../services/electron.service';
import {ProcessingService} from '../../services/processing.service';

describe('MainComponent', () => {
	let component: MainComponent;
	let fixture: ComponentFixture<MainComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;
	let processingServiceSpy: jasmine.SpyObj<ProcessingService>;
	let dialogSpy: jasmine.SpyObj<MatDialog>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', [
			'getSetting',
			'setSetting',
			'getAppVersion',
			'verifyCsv',
			'verifyDatabase',
			'verifyPath',
			'selectFile',
			'selectDirectory'
		]);
		electronServiceSpy.getSetting.and.returnValue('');
		electronServiceSpy.getAppVersion.and.returnValue('2.0.0-test');

		processingServiceSpy = jasmine.createSpyObj('ProcessingService', ['processWithResult', 'processData', 'getProcessingResult']);
		processingServiceSpy.processWithResult.and.returnValue(of({Success: true, ProcessedRows: 10, Duration: 1000}));

		dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
		dialogSpy.open.and.returnValue({afterClosed: () => of(undefined)} as MatDialogRef<unknown>);

		await TestBed.configureTestingModule({
			imports: [
				MainComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule
			],
			providers: [
				{provide: ElectronService, useValue: electronServiceSpy},
				{provide: ProcessingService, useValue: processingServiceSpy},
				{provide: MatDialog, useValue: dialogSpy}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(MainComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have default validation state as all false', () => {
		expect(component.validationState).toEqual([false, false, false]);
	});

	it('should not be valid when not all steps are valid', () => {
		expect(component.allValid()).toBeFalse();
	});

	it('should be valid when all steps are valid', () => {
		component.setState(0, true);
		component.setState(1, true);
		component.setState(2, true);
		expect(component.allValid()).toBeTrue();
	});

	it('should set validation state at given index', () => {
		component.setState(1, true);
		expect(component.validationState[1]).toBeTrue();
	});

	it('should update maxRows on row count change', () => {
		component.onRowCountChange(500);
		expect(component.maxRows).toBe(500);
	});

	it('should return 0 progress when maxRows is 0', () => {
		component.maxRows = 0;
		expect(component.getProgressValue()).toBe(0);
	});

	it('should calculate progress value', () => {
		component.processedRows = 50;
		component.maxRows = 100;
		expect(component.getProgressValue()).toBe(50);
	});

	it('should not process when not all valid', () => {
		component.process();
		expect(processingServiceSpy.processWithResult).not.toHaveBeenCalled();
	});

	it('should open settings dialog', () => {
		component.openSettingsDialog();
		expect(dialogSpy.open).toHaveBeenCalled();
	});

	it('should open help dialog', () => {
		component.openHelpDialog();
		expect(dialogSpy.open).toHaveBeenCalled();
	});
});
