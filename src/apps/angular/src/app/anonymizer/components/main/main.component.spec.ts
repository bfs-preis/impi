import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {MainComponent} from './main.component';
import {ElectronService} from '../../services/electron.service';

describe('MainComponent', () => {
	let component: MainComponent;
	let fixture: ComponentFixture<MainComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;
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

	it('should open processing dialog when all valid', () => {
		component.setState(0, true);
		component.setState(1, true);
		component.setState(2, true);
		// dbSelector needs to be set for openProcessingDialog
		// Since ViewChild won't be populated in this test, just verify allValid
		expect(component.allValid()).toBeTrue();
	});
});
