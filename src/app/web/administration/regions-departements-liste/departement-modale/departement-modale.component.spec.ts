import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartementModaleComponent } from './departement-modale.component';
import { SharedModule } from 'src/app/shared.module';
import { ToasterService, ToasterModule } from 'angular2-toaster';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { JsonConverterService } from 'src/app/services/json-converter.service';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { ErrorHandler } from '@angular/core';
import { GlobalViewComponent } from 'src/app/web/commun/global-view/global-view.component';



describe('DepartementModaleComponent', () => {
  let component: DepartementModaleComponent;
  let fixture: ComponentFixture<DepartementModaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, ToasterModule.forRoot() ],
      declarations: [ DepartementModaleComponent ],
      providers: [ToasterService, JsonConverterService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartementModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
