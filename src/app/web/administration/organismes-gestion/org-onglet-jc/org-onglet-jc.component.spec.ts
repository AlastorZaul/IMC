import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgOngletJcComponent } from './org-onglet-jc.component';

describe('OrgOngletJcComponent', () => {
  let component: OrgOngletJcComponent;
  let fixture: ComponentFixture<OrgOngletJcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgOngletJcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgOngletJcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
