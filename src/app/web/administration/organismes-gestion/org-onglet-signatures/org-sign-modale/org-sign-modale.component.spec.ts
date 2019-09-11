import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSignModaleComponent } from './org-sign-modale.component';

describe('OrgSignModaleComponent', () => {
  let component: OrgSignModaleComponent;
  let fixture: ComponentFixture<OrgSignModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgSignModaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgSignModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
