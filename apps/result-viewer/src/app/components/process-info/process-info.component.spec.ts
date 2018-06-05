import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessInfoComponent } from './process-info.component';

describe('ProcessInfoComponent', () => {
  let component: ProcessInfoComponent;
  let fixture: ComponentFixture<ProcessInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
