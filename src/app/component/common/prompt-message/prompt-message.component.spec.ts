import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptMessageComponent } from './prompt-message.component';

describe('PromptMessageComponent', () => {
  let component: PromptMessageComponent;
  let fixture: ComponentFixture<PromptMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
