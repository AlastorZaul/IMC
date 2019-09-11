import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EspaceDocumentaireComponent } from './espace-documentaire.component';
import { SharedModule } from 'src/app/shared.module';
import { ToasterService } from 'angular2-toaster';
import { JsonConverterService } from 'src/app/services/json-converter.service';
import { ErrorHandler } from '@angular/core';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuArborescentComponent } from './menu-arborescent/menu-arborescent.component';
import { ArticleService } from 'src/app/services/crud/article.service';



describe('EspaceDocumentaireComponent', () => {
  let component: EspaceDocumentaireComponent;
  let fixture: ComponentFixture<EspaceDocumentaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [ MenuArborescentComponent, EspaceDocumentaireComponent ],
      providers: [ToasterService, JsonConverterService, ArticleService,
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EspaceDocumentaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
