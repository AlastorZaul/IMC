import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletControleComponent } from './dem-onglet-controle.component';

describe('DemOngletControleComponent', () => {
  let component: DemOngletControleComponent;
  let fixture: ComponentFixture<DemOngletControleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletControleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletControleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
