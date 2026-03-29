import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of} from 'rxjs';
import {OutputSelectorComponent} from './output-selector.component';
import {ElectronService} from '../../services/electron.service';

describe('OutputSelectorComponent', () => {
	let component: OutputSelectorComponent;
	let fixture: ComponentFixture<OutputSelectorComponent>;
	let electronServiceSpy: jasmine.SpyObj<ElectronService>;

	beforeEach(async () => {
		electronServiceSpy = jasmine.createSpyObj('ElectronService', ['getSetting', 'setSetting', 'verifyPath', 'selectDirectory']);
		electronServiceSpy.getSetting.and.returnValue(null);
		electronServiceSpy.verifyPath.and.returnValue(of(true));

		await TestBed.configureTestingModule({
			imports: [
				OutputSelectorComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule
			],
			providers: [{provide: ElectronService, useValue: electronServiceSpy}]
		}).compileComponents();

		fixture = TestBed.createComponent(OutputSelectorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have default state', () => {
		expect(component.path).toBeNull();
		expect(component.isValidPath).toBeFalse();
		expect(component.isValidating).toBeFalse();
	});

	it('should load saved path on init', () => {
		electronServiceSpy.getSetting.and.returnValue('/mock/output');
		component.ngOnInit();
		expect(electronServiceSpy.verifyPath).toHaveBeenCalledWith('/mock/output');
	});

	it('should save path selection to settings', () => {
		component.onPathSelected('/mock/output');
		expect(electronServiceSpy.setSetting).toHaveBeenCalledWith('OutDirectory', '/mock/output');
	});

	it('should emit invalid when path is null', () => {
		spyOn(component.isValid, 'emit');
		component.path = null;
		component.verifyPath();
		expect(component.isValid.emit).toHaveBeenCalledWith(false);
	});

	it('should return empty string for short path when no path', () => {
		component.path = null;
		expect(component.getShortPath()).toBe('');
	});

	it('should return full path when short enough', () => {
		component.path = '/short/path';
		expect(component.getShortPath()).toBe('/short/path');
	});

	it('should truncate long paths', () => {
		component.path = '/very/long/path/that/exceeds/fifty/characters/in/total/length/for/testing';
		const result = component.getShortPath();
		expect(result.startsWith('...')).toBeTrue();
		expect(result.length).toBeLessThanOrEqual(50);
	});
});
