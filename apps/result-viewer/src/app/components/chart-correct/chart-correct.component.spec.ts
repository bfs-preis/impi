import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCorrectComponent } from './chart-correct.component';

describe('ChartCorrectComponent', () => {
  let component: ChartCorrectComponent;
  let fixture: ComponentFixture<ChartCorrectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartCorrectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartCorrectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
