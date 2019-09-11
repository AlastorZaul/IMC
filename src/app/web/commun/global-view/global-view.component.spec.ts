import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalViewComponent } from './global-view.component';
import { ToasterService, ToasterModule } from 'angular2-toaster';
import { ErrorHandler } from '@angular/core';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';


describe('GlobalViewComponent', () => {
  let component: GlobalViewComponent;
  let fixture: ComponentFixture<GlobalViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ToasterModule],
      declarations: [ HeaderComponent, FooterComponent, GlobalViewComponent ],
      providers: [ToasterService,
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
