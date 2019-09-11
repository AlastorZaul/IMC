import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaleDemandeTeleRCComponent } from './modale-demande-tele-rc.component';

describe('ModaleDemandeTeleRCComponent', () => {
  let component: ModaleDemandeTeleRCComponent;
  let fixture: ComponentFixture<ModaleDemandeTeleRCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModaleDemandeTeleRCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaleDemandeTeleRCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
