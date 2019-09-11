import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletCalculComponent } from './dem-onglet-calcul.component';

describe('DemOngletCalculComponent', () => {
  let component: DemOngletCalculComponent;
  let fixture: ComponentFixture<DemOngletCalculComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletCalculComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletCalculComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
