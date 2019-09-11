import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletSalarieComponent } from './dem-onglet-salarie.component';

describe('DemOngletSalarieComponent', () => {
  let component: DemOngletSalarieComponent;
  let fixture: ComponentFixture<DemOngletSalarieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletSalarieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletSalarieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
