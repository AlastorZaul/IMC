import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { JourChomeModaleComponent } from './jour-chome-modale.component';
import { SharedModule } from 'src/app/shared.module';
import { ToasterService } from 'angular2-toaster';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { JsonConverterService } from 'src/app/services/json-converter.service';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { ErrorHandler } from '@angular/core';


describe('JourChomeModaleComponent', () => {
  let component: JourChomeModaleComponent;
  let fixture: ComponentFixture<JourChomeModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ JourChomeModaleComponent ],
      providers: [ToasterService, JsonConverterService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourChomeModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
