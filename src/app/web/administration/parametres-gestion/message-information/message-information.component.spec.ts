import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageInformationComponent } from './message-information.component';

describe('MessageInformationComponent', () => {
  let component: MessageInformationComponent;
  let fixture: ComponentFixture<MessageInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
