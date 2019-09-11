import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametresGestionComponent } from './parametres-gestion.component';

describe('ParametresGestionComponent', () => {
  let component: ParametresGestionComponent;
  let fixture: ComponentFixture<ParametresGestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParametresGestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametresGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
