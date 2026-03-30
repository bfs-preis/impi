import {TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
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
			]
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});
});
