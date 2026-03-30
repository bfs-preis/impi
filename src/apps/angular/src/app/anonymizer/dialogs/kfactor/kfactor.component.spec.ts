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
		dialogRefSpy.disableClose = false;

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

	it('should auto-start check on init', () => {
		expect(electronServiceSpy.checkKFactor).toHaveBeenCalledWith('/mock/test.db');
	});

	it('should show success state when check passes', () => {
		expect(component.state).toBe('success');
		expect(component.error).toBeNull();
	});

	it('should show error state when check fails', async () => {
		electronServiceSpy.checkKFactor.and.returnValue(of(false));
		component.state = 'checking';
		component.ngOnInit();
		expect(component.state).toBe('error');
	});

	it('should show error state on service error', async () => {
		electronServiceSpy.checkKFactor.and.returnValue(throwError(() => new Error('Check failed')));
		component.state = 'checking';
		component.ngOnInit();
		expect(component.state).toBe('error');
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
