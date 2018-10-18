import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlankQuestionComponent } from './blank-question.component';

describe('BlankQuestionComponent', () => {
  let component: BlankQuestionComponent;
  let fixture: ComponentFixture<BlankQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlankQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlankQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
