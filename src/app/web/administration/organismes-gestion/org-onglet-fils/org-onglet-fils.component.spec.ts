import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgOngletFilsComponent } from './org-onglet-fils.component';

describe('OrgOngletFilsComponent', () => {
  let component: OrgOngletFilsComponent;
  let fixture: ComponentFixture<OrgOngletFilsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgOngletFilsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgOngletFilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
