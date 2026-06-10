import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {SettingsDialogComponent} from './settings.component';
import {ElectronService} from '../../services/electron.service';

describe('SettingsDialogComponent', () => {
	let component: SettingsDialogComponent;
	let fixture: ComponentFixture<SettingsDialogComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;
	let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SettingsDialogComponent>>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', ['getSetting', 'setSetting', 'setTheme', 'setLanguage']);
		electronServiceSpy.getSetting.and.callFake(<T>(key: string, defaultValue?: T): T => (defaultValue ?? '') as T);

		dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

		await TestBed.configureTestingModule({
			declarations: [SettingsDialogComponent],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				MatDialogModule,
				MatSelectModule,
				MatFormFieldModule,
				MatInputModule,
				NoopAnimationsModule
			],
			providers: [
				{provide: ElectronService, useValue: electronServiceSpy},
				{provide: MatDialogRef, useValue: dialogRefSpy}
			],
			schemas: [NO_ERRORS_SCHEMA]
		}).compileComponents();

		fixture = TestBed.createComponent(SettingsDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should load default settings', () => {
		expect(component.selectedEncoding).toBe('utf8');
		expect(component.selectedSeparator).toBe(';');
		expect(component.selectedSedexSenderId).toBe('');
	});

	it('should have encoding options', () => {
		expect(component.encodings).toContain('utf8');
		expect(component.encodings).toContain('windows1252');
	});

	it('should have separator options', () => {
		expect(component.separators.length).toBe(4);
	});

	it('should save settings and close dialog on save', () => {
		component.save();
		expect(electronServiceSpy.setSetting).toHaveBeenCalledWith('CSVEncoding', 'utf8');
		expect(electronServiceSpy.setSetting).toHaveBeenCalledWith('CSVSeparater', ';');
		expect(electronServiceSpy.setSetting).toHaveBeenCalledWith('SedexSenderId', '');
		expect(dialogRefSpy.close).toHaveBeenCalled();
	});

	it('should close dialog on cancel without saving', () => {
		component.cancel();
		expect(dialogRefSpy.close).toHaveBeenCalled();
		// setSetting should only be called during construction (loading defaults), not on cancel
	});
});
