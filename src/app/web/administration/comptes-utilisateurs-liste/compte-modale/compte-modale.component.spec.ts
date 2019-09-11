import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteModaleComponent } from './compte-modale.component';
import { SharedModule } from 'src/app/shared.module';
import { ToasterService } from 'angular2-toaster';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { JsonConverterService } from 'src/app/services/json-converter.service';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { ErrorHandler } from '@angular/core';

describe('CompteModaleComponent', () => {
  let component: CompteModaleComponent;
  let fixture: ComponentFixture<CompteModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ CompteModaleComponent ],
      providers: [ToasterService, JsonConverterService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompteModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
