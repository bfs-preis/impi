import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {CsvSelectorComponent} from './csv-selector.component';
import {ElectronService} from '../../services/electron.service';

describe('CsvSelectorComponent', () => {
	let component: CsvSelectorComponent;
	let fixture: ComponentFixture<CsvSelectorComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', ['getSetting', 'setSetting', 'verifyCsv', 'selectFile']);
		electronServiceSpy.getSetting.and.returnValue(null);
		electronServiceSpy.verifyCsv.and.returnValue(of(10));

		await TestBed.configureTestingModule({
			imports: [
				CsvSelectorComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule
			],
			providers: [{provide: ElectronService, useValue: electronServiceSpy}]
		}).compileComponents();

		fixture = TestBed.createComponent(CsvSelectorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have default state', () => {
		expect(component.file).toBeNull();
		expect(component.rowCount).toBe(0);
		expect(component.isValidFile).toBeFalse();
		expect(component.isValidating).toBeFalse();
	});

	it('should load saved file on init', () => {
		electronServiceSpy.getSetting.and.callFake(<T>(key: string): T => (key === 'CSVFile' ? '/mock/test.csv' : ';') as T);
		component.ngOnInit();
		expect(electronServiceSpy.verifyCsv).toHaveBeenCalled();
	});

	it('should save file selection to settings', () => {
		component.onFileSelected('/mock/data.csv');
		expect(electronServiceSpy.setSetting).toHaveBeenCalledWith('CSVFile', '/mock/data.csv');
	});

	it('should emit invalid when file is null', () => {
		spyOn(component.isValid, 'emit');
		component.file = null;
		component.verifyFile();
		expect(component.isValid.emit).toHaveBeenCalledWith(false);
	});

	it('should format row count', () => {
		component.rowCount = 1234;
		expect(component.formatRowCount()).toBe((1234).toLocaleString());
	});
});
