import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListeAccordeonsItemComponent } from './liste-accordeons-item.component';
import { SharedModule } from 'src/app/shared.module';
import { ToasterService } from 'angular2-toaster';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { JsonConverterService } from 'src/app/services/json-converter.service';
import { ErrorHandler } from '@angular/core';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { RouterTestingModule } from '@angular/router/testing';
import { RegionsDepartementsListeComponent } from '../regions-departements-liste.component';


describe('ListeAccordeonsItemComponent', () => {
  let component: ListeAccordeonsItemComponent;
  let fixture: ComponentFixture<ListeAccordeonsItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [ RegionsDepartementsListeComponent, ListeAccordeonsItemComponent ],
      providers: [ToasterService, JsonConverterService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeAccordeonsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
