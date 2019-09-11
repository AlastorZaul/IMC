import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ToasterService, ToasterModule } from 'angular2-toaster';
import { ErrorHandler } from '@angular/core';
import { SircErrorsHandler } from 'src/app/services/sirc-errors-handler';
import { RouterTestingModule } from '@angular/router/testing';



describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ToasterModule],
      declarations: [ HeaderComponent ],
      providers: [ToasterService,
        { provide: ErrorHandler, useClass: SircErrorsHandler },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
