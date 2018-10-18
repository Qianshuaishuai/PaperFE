import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerSheetComponent } from './answer-sheet.component';

describe('AnswerSheetComponent', () => {
  let component: AnswerSheetComponent;
  let fixture: ComponentFixture<AnswerSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
