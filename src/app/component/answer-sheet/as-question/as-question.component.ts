import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { Question } from '../data/question';

@Component({
  selector: 'app-as-question',
  templateUrl: './as-question.component.html',
  styleUrls: ['./as-question.component.scss']
})
export class AsQuestionComponent implements OnInit, OnDestroy {

  @Input() isDownloadMode: boolean;
  @Input() question: Question;

  @Output() addMarkQuestion = new EventEmitter<any>();
  @Output() addSubQuestion = new EventEmitter<any>();
  @Output() autoSave = new EventEmitter<any>();
  @Output() removeMarkQuestion = new EventEmitter<any>();
  @Output() removeSubQuestion = new EventEmitter<any>();
  @Output() resizeSubQuestion = new EventEmitter<any>();
  @Output() setComposition = new EventEmitter<any>();
  @Output() showGroupCapacitySetting = new EventEmitter<any>();
  @Output() questionTitleChange = new EventEmitter<any>();

  editors = [];
  questionTitle: string;
  isEditorsSet = [];

  constructor() { }

  ngOnInit() {
    this.questionTitle = this.question.title;
    for (let i = 0; i !== this.question.subQuestions.length; i++) {
      this.isEditorsSet.push(false);
    }
  }

  ngOnDestroy() {
    if (this.editors.length !== 0) {
      this.editors.forEach(editor => {
        editor.destroy();
      });
      this.editors = [];
    }
  }

  private onAutoSave(i, height, innerHtml): void {
    const params = {
      questionTitle: this.question.title,
      subQuestionIndex: this.question.subQuestions[i].index,
      innerHtml: innerHtml,
      height: height,
      partIndex: this.question.subQuestions[i].partIndex
    };
    this.autoSave.emit(params);
  }

  onAddMarkQuestion(): void {
    this.addMarkQuestion.emit();
  }

  onAddSubQuestion(): void {
    const params = {
      questionTitle: this.question.title,
      questionType: this.question.subQuestions[0].type
    };
    this.addSubQuestion.emit(params);
  }

  onBlur(event, i): void {
    // 测试版有ng注释
    // this.onAutoSave(i, event.currentTarget.childNodes[1].clientHeight, event.currentTarget.innerHTML);
    // 正式版没ng注释
    this.onAutoSave(i, event.currentTarget.childNodes[0].clientHeight, event.currentTarget.innerHTML);
  }

  onFocus(i): void {
    if (!this.isEditorsSet[i]) {
      const editor = CKEDITOR.inline(event.currentTarget, {
        toolbar_Full: [
          { name: 'size', items: ['FontSize', 'lineheight'] },
          // { name: 'basic', items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', 'CreatePlaceholder', 'RemoveFormat'] },
          { name: 'basic', items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', 'RemoveFormat'] },
          { name: 'align', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight'] },
          // { name: 'insert', items: ['Image', 'Table', 'SpecialChar'] },
          { name: 'insert', items: ['SpecialChar'] },
          // { name: 'wiris', items: [ 'ckeditor_wiris_formulaEditor'] },
          { name: 'clipboard', items: ['Undo', 'Redo'] }
        ],
        // extraPlugins: 'justify,lineheight,ckeditor_wiris,removeformat,placeholder,font'
        extraPlugins: 'justify,lineheight,removeformat,font',
        removePlugins: 'magicline'
      });
      this.editors.push(editor);
      this.isEditorsSet[i] = true;
    }
  }

  onQuestionTitleChange(): void {
    const params = {
      oldTitle: this.question.title,
      newTitle: this.questionTitle
    };
    this.questionTitleChange.emit(params);
  }

  onRemoveMarkQuestion(): void {
    this.removeMarkQuestion.emit();
  }

  onRemoveSubQuestion(i): void {
    const params = {
      questionTitle: this.question.title,
      subQuestionIndex: this.question.subQuestions[i].index
    };
    this.removeSubQuestion.emit(params);
  }

  onSetComposition(): void {
    const params = {
      questionType: this.question.subQuestions[0].type,
      questionTitle: this.question.title
    };
    this.setComposition.emit(params);
  }

  onShowGroupCapacitySetting(): void {
    this.showGroupCapacitySetting.emit(true);
  }

  validateResize(event: ResizeEvent): boolean {
    // 若答题框高度达到最小值则不能再缩小
    // 这几把玩意不知道怎么传变量，先写死吧
    return event.rectangle.height > 50;
  }

  onResizeEnd(event: ResizeEvent, subQuestionIndex: number): void {
    const params = {
      questionTitle: this.question.title,
      subQuestionIndex: this.question.subQuestions[subQuestionIndex].index,
      deltaLength: event.edges.bottom
    };
    this.resizeSubQuestion.emit(params);
  }

  showInnerHtml(index: number): string {
    let innerHtml = '';
    this.question.subQuestions[index].content.forEach(content => {
      innerHtml += content.innerHtml;
    });
    return innerHtml;
  }

  // 题型判断
  isFillInQuestion(type: number): boolean {
    return type === 10005 || type === 10006;
  }
  // 非选择、填空题
  isAnswerQuestion(type: number): boolean {
    return type > 10006;
  }
  isChineseComposition(type: number): boolean {
    return type === 0;
  }
  isEnglishComposition(type: number): boolean {
    return type === 1;
  }
  isComposition(type: number): boolean {
    return this.isChineseComposition(type) || this.isEnglishComposition(type);
  }
}
