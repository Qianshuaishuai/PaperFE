import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AnswerSheet } from '../data/answerSheet';

@Component({
  selector: 'app-answer-sheet',
  templateUrl: './answer-sheet.component.html',
  styleUrls: ['./answer-sheet.component.scss']
})
export class AnswerSheetComponent implements OnInit {

  @Input() attention: string;
  @Input() answerSheet: AnswerSheet;
  @Input() isDownloadMode: boolean;
  @Input() isOverflow: boolean;
  @Input() isShowPageIndex: boolean;
  @Input() pageCounts: number;
  @Input() pageIndex: number;
  @Input() paperTitle: string;

  @Output() addMarkQuestion = new EventEmitter<any>();
  @Output() addSubQuestion = new EventEmitter<any>();
  @Output() attentionChange = new EventEmitter<any>();
  @Output() attentionOverflow = new EventEmitter<any>();
  @Output() autoSave = new EventEmitter<any>();
  @Output() overflow = new EventEmitter<any>();
  @Output() setPageOverflow = new EventEmitter<any>();
  @Output() questionTitleChange = new EventEmitter<any>();
  @Output() removeMarkQuestion = new EventEmitter<any>();
  @Output() removeSubQuestion = new EventEmitter<any>();
  @Output() resizeSubQuestion = new EventEmitter<any>();
  @Output() setComposition = new EventEmitter<any>();
  @Output() showGroupCapacitySetting = new EventEmitter<any>();
  @Output() titleChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.setPageOverflow.emit(this.isOverflow);
  }

  onAddMarkQuestion(): void {
    this.addMarkQuestion.emit();
  }

  onAddSubQuestion(event: any): void {
    this.addSubQuestion.emit(event);
  }

  onAttentionChange(event: any): void {
    this.attentionChange.emit(event);
  }

  onAttentionOverflow(): void {
    this.attentionOverflow.emit();
  }

  onAutoSave(event: any): void {
    this.autoSave.emit(event);
  }

  onOverflow(): void {
    this.overflow.emit();
  }

  onQuestionTitleChange(event: any): void {
    this.questionTitleChange.emit(event);
  }

  onRemoveMarkQuestion(): void {
    this.removeMarkQuestion.emit();
  }

  onRemoveSubQuestion(event: any): void {
    this.removeSubQuestion.emit(event);
  }

  onResizeSubQuestion(event: any): void {
    this.resizeSubQuestion.emit(event);
  }

  onSetComposition(event): void {
    this.setComposition.emit(event);
  }

  onShowGroupCapacitySetting(event: any): void {
    this.showGroupCapacitySetting.emit(event);
  }

  onTitleChange(event: any): void {
    this.titleChange.emit(event);
  }
}
