import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesRechercheComponent } from './demandes-recherche.component';

describe('DemandesRechercheComponent', () => {
  let component: DemandesRechercheComponent;
  let fixture: ComponentFixture<DemandesRechercheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandesRechercheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandesRechercheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
