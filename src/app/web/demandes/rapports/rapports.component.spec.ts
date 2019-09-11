import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RapportsComponent } from './rapports.component';
import { ToasterService, ToasterModule } from 'angular2-toaster';
import { ErrorHandler } from '@angular/core';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared.module';
import { JsonConverterService } from 'src/app/services/json-converter.service';


describe('RapportsComponent', () => {
  let component: RapportsComponent;
  let fixture: ComponentFixture<RapportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [ RapportsComponent ],
      providers: [ToasterService, JsonConverterService,
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
