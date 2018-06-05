import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartViolationsComponent } from './chart-violations.component';

describe('ChartViolationsComponent', () => {
  let component: ChartViolationsComponent;
  let fixture: ComponentFixture<ChartViolationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartViolationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
