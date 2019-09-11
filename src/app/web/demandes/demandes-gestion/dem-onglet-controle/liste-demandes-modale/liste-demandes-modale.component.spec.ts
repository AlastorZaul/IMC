import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDemandesModaleComponent } from './liste-demandes-modale.component';

describe('ListeDemandesModaleComponent', () => {
  let component: ListeDemandesModaleComponent;
  let fixture: ComponentFixture<ListeDemandesModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListeDemandesModaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeDemandesModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
