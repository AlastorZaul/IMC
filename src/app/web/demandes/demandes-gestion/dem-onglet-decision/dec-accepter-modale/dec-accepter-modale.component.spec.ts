import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecAccepterModaleComponent } from './dec-accepter-modale.component';

describe('DecAccepterModaleComponent', () => {
  let component: DecAccepterModaleComponent;
  let fixture: ComponentFixture<DecAccepterModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecAccepterModaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecAccepterModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
