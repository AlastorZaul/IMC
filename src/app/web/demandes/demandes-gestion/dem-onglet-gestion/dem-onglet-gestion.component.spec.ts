import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletGestionComponent } from './dem-onglet-gestion.component';

describe('DemOngletGestionComponent', () => {
  let component: DemOngletGestionComponent;
  let fixture: ComponentFixture<DemOngletGestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletGestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
