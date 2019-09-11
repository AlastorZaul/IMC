import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemOngletCalendrierComponent } from './dem-onglet-calendrier.component';

describe('DemOngletCalendrierComponent', () => {
  let component: DemOngletCalendrierComponent;
  let fixture: ComponentFixture<DemOngletCalendrierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemOngletCalendrierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemOngletCalendrierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
