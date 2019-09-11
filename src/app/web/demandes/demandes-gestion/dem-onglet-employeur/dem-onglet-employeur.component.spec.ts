import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletEmployeurComponent } from './dem-onglet-employeur.component';

describe('DemOngletEmployeurComponent', () => {
  let component: DemOngletEmployeurComponent;
  let fixture: ComponentFixture<DemOngletEmployeurComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletEmployeurComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletEmployeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
