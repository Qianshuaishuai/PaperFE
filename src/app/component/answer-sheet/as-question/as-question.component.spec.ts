import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsQuestionComponent } from './as-question.component';

describe('AsQuestionComponent', () => {
  let component: AsQuestionComponent;
  let fixture: ComponentFixture<AsQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
