import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaleDemandePapierComponent } from './modale-demande-papier.component';

describe('ModaleDemandePapierComponent', () => {
  let component: ModaleDemandePapierComponent;
  let fixture: ComponentFixture<ModaleDemandePapierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModaleDemandePapierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaleDemandePapierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
