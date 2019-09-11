import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutEnfantModaleComponent } from './ajout-enfant-modale.component';

describe('AjoutEnfantModaleComponent', () => {
  let component: AjoutEnfantModaleComponent;
  let fixture: ComponentFixture<AjoutEnfantModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjoutEnfantModaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutEnfantModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
