import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletCommunComponent } from './dem-onglet-commun.component';

describe('DemOngletCommunComponent', () => {
  let component: DemOngletCommunComponent;
  let fixture: ComponentFixture<DemOngletCommunComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletCommunComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletCommunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
