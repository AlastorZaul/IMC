import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgOngletInfosComponent } from './org-onglet-infos.component';

describe('OrgOngletInfosComponent', () => {
  let component: OrgOngletInfosComponent;
  let fixture: ComponentFixture<OrgOngletInfosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgOngletInfosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgOngletInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
