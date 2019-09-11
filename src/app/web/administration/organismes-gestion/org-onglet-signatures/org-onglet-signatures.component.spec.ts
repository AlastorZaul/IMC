import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgOngletSignaturesComponent } from './org-onglet-signatures.component';

describe('OrgOngletSignaturesComponent', () => {
  let component: OrgOngletSignaturesComponent;
  let fixture: ComponentFixture<OrgOngletSignaturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgOngletSignaturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgOngletSignaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
