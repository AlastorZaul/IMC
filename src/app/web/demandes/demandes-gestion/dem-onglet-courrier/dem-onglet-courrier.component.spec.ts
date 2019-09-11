import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletCourrierComponent } from './dem-onglet-courrier.component';

describe('DemOngletCourrierComponent', () => {
  let component: DemOngletCourrierComponent;
  let fixture: ComponentFixture<DemOngletCourrierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletCourrierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletCourrierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
