import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog} from '@angular/material/dialog';
import {of, Observable} from 'rxjs';
import {DbSelectorComponent} from './db-selector.component';
import {ElectronService} from '../../services/electron.service';
import {IDbInfo} from '../../models';

describe('DbSelectorComponent', () => {
	let component: DbSelectorComponent;
	let fixture: ComponentFixture<DbSelectorComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;
	let dialogSpy: jasmine.SpyObj<MatDialog>;

	const mockDbInfo: IDbInfo = {
		Version: '1.5.2',
		PeriodFrom: new Date('2024-01-01').valueOf(),
		PeriodTo: new Date('2024-12-31').valueOf()
	};

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', [
			'getSetting',
			'setSetting',
			'verifyDatabase',
			'selectFile',
			'checkKFactor'
		]);
		electronServiceSpy.getSetting.and.returnValue(null);
		electronServiceSpy.verifyDatabase.and.returnValue(of(mockDbInfo));

		dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

		await TestBed.configureTestingModule({
			imports: [
				DbSelectorComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule
			],
			providers: [
				{provide: ElectronService, useValue: electronServiceSpy},
				{provide: MatDialog, useValue: dialogSpy}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(DbSelectorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have default state', () => {
		expect(component.file).toBeNull();
		expect(component.dbInfo).toBeNull();
		expect(component.isValidFile).toBeFalse();
	});

	it('should load saved file on init', () => {
		electronServiceSpy.getSetting.and.returnValue('/mock/test.db');
		component.ngOnInit();
		expect(electronServiceSpy.verifyDatabase).toHaveBeenCalledWith('/mock/test.db');
	});

	it('should save file selection to settings', () => {
		component.onFileSelected('/mock/data.db');
		expect(electronServiceSpy.setSetting).toHaveBeenCalledWith('DBFile', '/mock/data.db');
	});

	it('should emit invalid when file is null', () => {
		spyOn(component.isValid, 'emit');
		component.file = null;
		component.verifyFile();
		expect(component.isValid.emit).toHaveBeenCalledWith(false);
	});

	it('should return version from dbInfo', () => {
		component.dbInfo = mockDbInfo;
		expect(component.getVersion()).toBe('1.5.2');
	});

	it('should return empty string for version when no dbInfo', () => {
		component.dbInfo = null;
		expect(component.getVersion()).toBe('');
	});

	it('should return empty string for period when no dbInfo', () => {
		component.dbInfo = null;
		expect(component.getPeriod()).toBe('');
	});

	it('should not open dialog if no file selected', () => {
		component.file = null;
		component.openKFactorDialog();
		expect(dialogSpy.open).not.toHaveBeenCalled();
	});

	it('should open kfactor dialog when file is selected', () => {
		component.file = '/mock/test.db';
		component.openKFactorDialog();
		expect(dialogSpy.open).toHaveBeenCalled();
	});

	it('should set dbInfo on successful verification', () => {
		component.file = '/mock/test.db';
		component.verifyFile();
		expect(component.isValidFile).toBeTrue();
		expect(component.dbInfo).toBeTruthy();
		expect(component.dbInfo!.Version).toBe('1.5.2');
		expect(component.isValidating).toBeFalse();
	});

	it('should handle verification error', () => {
		electronServiceSpy.verifyDatabase.and.returnValue(new Observable(obs => obs.error({message: 'corrupt db'})));
		component.file = '/mock/bad.db';
		component.verifyFile();
		expect(component.isValidFile).toBeFalse();
		expect(component.dbInfo).toBeNull();
		expect(component.error).toBe('corrupt db');
		expect(component.isValidating).toBeFalse();
	});

	it('should emit valid true on successful verification', () => {
		spyOn(component.isValid, 'emit');
		component.file = '/mock/test.db';
		component.verifyFile();
		expect(component.isValid.emit).toHaveBeenCalledWith(true);
	});

	it('should return card-valid class when valid', () => {
		component.isValidFile = true;
		component.isValidating = false;
		component.error = null;
		expect(component.getCardClass()).toBe('card-valid');
	});

	it('should return card-validating class when validating', () => {
		component.isValidating = true;
		expect(component.getCardClass()).toBe('card-validating');
	});

	it('should return card-error class when error', () => {
		component.isValidating = false;
		component.isValidFile = false;
		component.error = 'some error';
		expect(component.getCardClass()).toBe('card-error');
	});

	it('should return formatted period when dbInfo set', () => {
		component.dbInfo = mockDbInfo;
		const period = component.getPeriod();
		expect(period).toContain('-');
		expect(period.length).toBeGreaterThan(0);
	});
});
