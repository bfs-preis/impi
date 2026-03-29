import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import {HelpDialogComponent} from './help.component';
import {ElectronService} from '../../services/electron.service';

describe('HelpDialogComponent', () => {
	let component: HelpDialogComponent;
	let fixture: ComponentFixture<HelpDialogComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', ['getAppVersion']);
		electronServiceSpy.getAppVersion.and.returnValue('2.0.0-test');

		await TestBed.configureTestingModule({
			imports: [
				HelpDialogComponent,
				TranslateModule.forRoot(),
				MatDialogModule,
				NoopAnimationsModule
			],
			providers: [{provide: ElectronService, useValue: electronServiceSpy}]
		}).compileComponents();

		fixture = TestBed.createComponent(HelpDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have app version set', () => {
		expect(component.appVersion).toBe('2.0.0-test');
	});

	it('should call getAppVersion on construction', () => {
		expect(electronServiceSpy.getAppVersion).toHaveBeenCalled();
	});
});
