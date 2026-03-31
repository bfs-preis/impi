import {TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog} from '@angular/material/dialog';
import {AppComponent} from './app.component';
import {ElectronService} from './anonymizer/services/electron.service';

describe('AppComponent', () => {
	beforeEach(async () => {
		const electronSpy = jasmine.createSpyObj('ElectronService', ['getSetting']);
		const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

		await TestBed.configureTestingModule({
			imports: [RouterModule.forRoot([]), TranslateModule.forRoot(), NoopAnimationsModule],
			declarations: [AppComponent],
			providers: [
				{provide: ElectronService, useValue: electronSpy},
				{provide: MatDialog, useValue: dialogSpy}
			],
			schemas: [NO_ERRORS_SCHEMA]
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it('should open help dialog', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		const dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
		app.openHelpDialog();
		expect(dialog.open).toHaveBeenCalled();
	});

	it('should open settings dialog', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		const dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
		app.openSettingsDialog();
		expect(dialog.open).toHaveBeenCalled();
	});
});
