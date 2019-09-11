import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesGestionComponent } from './demandes-gestion.component';

describe('DemandesGestionComponent', () => {
  let component: DemandesGestionComponent;
  let fixture: ComponentFixture<DemandesGestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandesGestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandesGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
