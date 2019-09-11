import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganismesRechercheComponent } from './organismes-recherche.component';

describe('OrganismesRechercheComponent', () => {
  let component: OrganismesRechercheComponent;
  let fixture: ComponentFixture<OrganismesRechercheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganismesRechercheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganismesRechercheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
