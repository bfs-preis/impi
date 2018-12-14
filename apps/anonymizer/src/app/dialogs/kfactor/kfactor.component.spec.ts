import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KfactorComponent } from './kfactor.component';

describe('KfactorComponent', () => {
  let component: KfactorComponent;
  let fixture: ComponentFixture<KfactorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KfactorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KfactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
