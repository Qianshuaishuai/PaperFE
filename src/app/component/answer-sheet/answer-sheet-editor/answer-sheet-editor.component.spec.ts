import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerSheetEditorComponent } from './answer-sheet-editor.component';

describe('AnswerSheetComponent', () => {
  let component: AnswerSheetEditorComponent;
  let fixture: ComponentFixture<AnswerSheetEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerSheetEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerSheetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
