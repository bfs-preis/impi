import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartMatchesComponent } from './chart-matches.component';

describe('ChartMatchesComponent', () => {
  let component: ChartMatchesComponent;
  let fixture: ComponentFixture<ChartMatchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartMatchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
