import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesConsultationRestreinteComponent } from './demandes-consultation-restreinte.component';

describe('DemandesConsultationRestreinteComponent', () => {
  let component: DemandesConsultationRestreinteComponent;
  let fixture: ComponentFixture<DemandesConsultationRestreinteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandesConsultationRestreinteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandesConsultationRestreinteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
