import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertModaleComponent } from './transfert-modale.component';

describe('TransfertModaleComponent', () => {
  let component: TransfertModaleComponent;
  let fixture: ComponentFixture<TransfertModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransfertModaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfertModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
