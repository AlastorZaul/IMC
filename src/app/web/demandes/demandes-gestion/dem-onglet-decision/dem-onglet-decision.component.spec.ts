import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletDecisionComponent } from './dem-onglet-decision.component';

describe('DemOngletDecisionComponent', () => {
  let component: DemOngletDecisionComponent;
  let fixture: ComponentFixture<DemOngletDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletDecisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
