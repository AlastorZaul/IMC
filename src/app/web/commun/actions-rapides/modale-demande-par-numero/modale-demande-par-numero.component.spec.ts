import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaleDemandeParNumeroComponent } from './modale-demande-par-numero.component';

describe('ModaleDemandeParNumeroComponent', () => {
  let component: ModaleDemandeParNumeroComponent;
  let fixture: ComponentFixture<ModaleDemandeParNumeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModaleDemandeParNumeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaleDemandeParNumeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
