import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';
import {KfactorDialogComponent} from './kfactor.component';
import {ElectronService} from '../../services/electron.service';

describe('KfactorDialogComponent', () => {
	let component: KfactorDialogComponent;
	let fixture: ComponentFixture<KfactorDialogComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;
	let dialogRefSpy: jasmine.SpyObj<MatDialogRef<KfactorDialogComponent>>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', ['checkKFactor']);
		electronServiceSpy.checkKFactor.and.returnValue(of(true));

		dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [
				KfactorDialogComponent,
				TranslateModule.forRoot(),
				MatDialogModule,
				NoopAnimationsModule
			],
			providers: [
				{provide: ElectronService, useValue: electronServiceSpy},
				{provide: MatDialogRef, useValue: dialogRefSpy},
				{provide: MAT_DIALOG_DATA, useValue: {file: '/mock/test.db'}}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(KfactorDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have default state', () => {
		expect(component.isChecking).toBeFalse();
		expect(component.checkComplete).toBeFalse();
		expect(component.checkResult).toBeNull();
		expect(component.error).toBeNull();
	});

	it('should have dialog data with file path', () => {
		expect(component.data.file).toBe('/mock/test.db');
	});

	it('should start check and update state on success', () => {
		component.startCheck();
		expect(component.isChecking).toBeFalse();
		expect(component.checkComplete).toBeTrue();
		expect(component.checkResult).toBeTrue();
	});

	it('should handle check error', () => {
		electronServiceSpy.checkKFactor.and.returnValue(throwError(() => new Error('Check failed')));
		component.startCheck();
		expect(component.isChecking).toBeFalse();
		expect(component.checkComplete).toBeTrue();
		expect(component.checkResult).toBeFalse();
		expect(component.error).toBe('Check failed');
	});

	it('should close dialog on close()', () => {
		component.close();
		expect(dialogRefSpy.close).toHaveBeenCalled();
	});

	it('should close dialog on cancel()', () => {
		component.cancel();
		expect(dialogRefSpy.close).toHaveBeenCalled();
	});
});
