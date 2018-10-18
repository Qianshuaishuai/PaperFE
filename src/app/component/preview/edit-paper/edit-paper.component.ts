
import { Component, OnInit, EventEmitter, Output, Input, ViewChild,
  ElementRef, ViewChildren, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { NodeEvent, Ng2TreeSettings } from 'ng2-tree';
import { PaperService } from '../../../service/paper.service';
import { PropertyService } from '../../../service/property.service';
import { KeyPoint } from '../../../bean/keypoint';
import { questionTypes, difficulties, QuestionType, Difficulty, NewQuestion } from './edit-config';
import { Question } from '../../details/paper-details/data/paperDetailsResponse';
import { Utils } from '../../../utils';
import * as _ from 'lodash';
import { PreviewPaperService } from '../../../service/preview-paper.service';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-paper',
  templateUrl: './edit-paper.component.html',
  styleUrls: ['./edit-paper.component.scss']
})

export class EditPaperComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() stageId: string;
  @Input() bookId: number;
  @Input() subjectId: number;
  @Input() editQuestion: Question;
  @Input() editCourseId: number;
  @Input() editChapterTypeName: string;
  @Input() editType: number;  // 1 编辑试题 2 改变题型 3 插入试题
  @Output() isCloseEditDialog = new EventEmitter<boolean>();
  @Output() refreshQuestion = new EventEmitter<boolean>();

  // 数据
  private teacherId: string;
  private accessToken: string;
  private special: string;      // 资源云平台用到的参数
  public question: Question;    // 深拷贝 真正操作的 question
  public keyPointList: KeyPoint[];
  public questionTypes: QuestionType[];
  public difficulties: Difficulty[];
  public keyPoints: any;
  private setSuitLargeSub: Subscription;
  private getKeyPointsSub: Subscription;
  private setSuitQuestionSub: Subscription;


  // 操作
  public isShowKeyPoints = false;
  public questionTypeId = 10001;  // 题型默认选中 单选题
  public difficultyId = 8;        // 难度默认选中 简单
  public isQuestions = false;     // 判断是否为材料题
  public isSingleOne = false;     // 判断是否只有一题
  public showKeyPointId = 0;    // 控制知识点列表的展示
  @ViewChild('scrollElementRef')
  private scrollElementRef;
  @ViewChild('treeComponent')
  public treeComponent;
  private OFFSET_TOP = 60;
  private editorKeys = [];
  private oldChangeType: number;  // 验证是否有改变题型
  public DEFAULT_DEBOUNCE_TIME = 500;
  private postCount = 0;

  // post
  @ViewChild('questionsContent')
  public questionsContent: ElementRef;  // 材料题
  @ViewChildren('questionContent')
  public questionContent;               // 题干
  @ViewChildren('questionOption')
  public questionOption;                // 题目选项
  @ViewChildren('questionSolution')
  public questionSolution;              // 解析
  @ViewChildren('questionBlankAnswer')
  public questionBlankAnswer;           // 主观/客观填空答案
  @ViewChildren('questionAnswer')
  public questionAnswer;                // 问答题

  // TreeSettings
  public settings: Ng2TreeSettings = {
    rootIsVisible: false,
    showCheckboxes: false,
  };

  constructor(
    private paperService: PaperService,
    private propertyService: PropertyService,
    private utils: Utils,
    private previewPaperService: PreviewPaperService,
    private messageService: MessageService,
    private rd: Renderer2,
  ) { }

  ngOnInit(): void {
    this.questionTypes = questionTypes;
    this.difficulties = difficulties;

    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    this.editCourseId = this.propertyService.readSubjectId();
    this.getKeyPoints();
    this.initEditQuestion();
  }

  ngAfterViewInit(): void {
  }

/*
  ngAfterViewInit(): void {
    CKEDITOR.inline('content0')
    this.editorKeys.push('questionContent0')
  }

  private initEditor(): void {
    let els = document.getElementsByClassName('ckEditor');
    this.openEditor(els)
  }

  private openEditor(elements): void {
    for (let i = 0, len = elements.length; i < len; i++) {
      let editor = CKEDITOR.inline(elements[i])
      this.editors.push(editor)
    }
  }
*/

  private initEditQuestion(): void {
    this.question = _.cloneDeep(this.editQuestion);
    if (this.question.questions) {
      this.isQuestions = true;
      this.question.questions.forEach(v => {
        if (v.content.substr(3, 1) === '（') {
          v.content = '<p>' + v.content.substr(6);
        }
        const temp = this.question.content.replace(/(<p[^>]*>)/g, '');
        this.question.content = temp.replace(/(<\/p>)/g, '<br/>');
      });
    } else {
      const singleQuestion = _.cloneDeep(this.question);
      this.question.questions = [singleQuestion];
      if (this.editType === 2) {
        this.oldChangeType = singleQuestion.type;
      }
    }
    if (this.editType === 3) {
      this.question.questions = [new NewQuestion];
      if (this.isQuestions) {
        this.question.type = this.question.questions[0].type;
      } else {
        setTimeout(() => {
          this.selectType(this.question.type, 0);
        }, 10);
      }
    }
    if (this.question.questions.length === 1) {
      this.isSingleOne = true;
    }
    this.initType();
    this.initDifficulty();
    this.resetPos();
    // const keyPoints = this.question.questions[0].keypoints;
    // if (keyPoints.length && keyPoints[0].id < 1000000) {
    //   this.initKeyPoint();
    // }
  }

  // 重新给填空题题号排序
  private resetPos(): void {
    this.question.questions.forEach((q, qIndex) => {
      if (q.type === 10005 || q.type === 10006) {
        q.content = q.content.replace(/\<pos contenteditable="false" id="([0-9]{1,2})"\>\d*\<\/pos\>/g,
          `<pos contenteditable="false" id="0"></pos>`);
        q.answer.forEach((a, index) => {
          q.content = q.content.replace(/\<pos contenteditable="false" id="([0-9]{1,2})"\>\<\/pos\>/,
          `<pos contenteditable="false" id="${index + 1}">${index + 1}</pos>`);
        });
      }
    });
  }

  private initType(): void {
    const questionId = this.question.type;
    if (this.questionTypes.some(type => type.id === questionId)) {
      this.questionTypeId = questionId;
    }
  }

  private initDifficulty(): void {
    const difficultyId = this.question.difficulty;
    this.difficultyId = this.transformDifficulty(difficultyId);
  }

  // private initKeyPoint(): void {
  //   this.question.questions.forEach(question => {
  //     question.keypoints = [];
  //   });
  // }

  public stopPropagation(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
  }

  public showKeyPoints(ev: Event, questionIndex: number): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.isShowKeyPoints = !this.isShowKeyPoints;
    this.showKeyPointId = questionIndex;
  }

  public closeEditDialog(): void {
    this.isCloseEditDialog.emit(false);
  }

  public removeOption(optionIndex: number, questionIndex: number): void {
    const question = this.question.questions[questionIndex];
    let len = question.options.length;
    if (len > 2) {
      for (let i = 0, l = question.options.length; i < l; i ++) {
        question.options[i] = 'del' + document.getElementById(`option${questionIndex}${i}`).innerHTML;
      }
      setTimeout(() => {
        question.options.splice(optionIndex, 1);
      }, 10);
      len--;
    }
    if (question.type === 10001 && +(question.answer) === len) {
      question.answer = '0';
      return;
    }
    if (question.type === 10001) {
      return;
    }
    const index = question.answer.indexOf(optionIndex.toString());
    if (index > -1) {
      question.answer.splice(index, 1);
    }
    question.answer.forEach(answer => {
      if (+answer === len) {
        question.answer.splice(index, 1);
      }
    });
  }

  public scoreUp(questionIndex: number) {
    if (this.question.questions[questionIndex].score < 999) {
      this.question.questions[questionIndex].score++;
    }
  }

  public scoreDown(questionIndex: number) {
    const score = this.question.questions[questionIndex].score;
    if (score < 1) {
      return;
    }
    this.question.questions[questionIndex].score--;
    const number = this.question.questions[questionIndex].score;
    this.question.questions[questionIndex].score = _.round(number, 1);
  }

  public addOption(questionIndex: number): void {
    if (this.question.questions[questionIndex].options.length < 10) {
      this.question.questions[questionIndex].options.push('');
    }
  }

  public modifyOption(optionIndex: number, questionIndex: number): void {
    this.question.questions[questionIndex].answer = optionIndex.toString();
  }

  public modifyOptions(optionIndex: number, questionIndex: number): void {
    let answers = this.question.questions[questionIndex].answer;
    const index = answers.indexOf(optionIndex.toString());
    if (index > -1) {
      answers.splice(index, 1);
    } else {
      answers.push(optionIndex.toString());
    }
    answers = answers.sort();
  }

  public modifyJudgeAnswer(optionIndex: number, questionIndex: number): void {
    this.question.questions[questionIndex].answer = optionIndex.toString();
  }

  public deleteQuestion(questionIndex: number): void {
    this.question.questions.splice(questionIndex, 1);
    if (this.question.questions.length === 1) {
      this.isSingleOne = true;
    }
  }

  public addQuestion(): void {
    this.question.questions.push(new NewQuestion);
    this.isSingleOne = false;
  }

  // 通用获取
  private handleSubmitQuestion(question: Question, index: number): void {
    if (this.editType === 3) {
      const el = <HTMLInputElement>document.getElementById(`questionScore${index}`);
      question.score = +(el.value);
    }
    // 获取小题题干
    // let content = this.questionContent._results[index].nativeElement.innerHTML.replace(/\<p\>/g, '').replace(/\<\/p\>/g, ''))
    let content = '';
    if (question.type === 10005 || question.type === 10006) {
      content = document.getElementById(`edit-question-title-${index}`).innerHTML;
      const str = `<input type='blank',size='14'></input>`;
      content = content.replace(/\<pos.*?\>[0-9]{0,2}\<\/pos\>/g, str);
    } else {
      // content = this.questionContent._results[index].nativeElement.innerHTML;
      content = document.getElementById(`content${index}`).innerHTML;
    }
    this.getMathMl(content);
    if (this.editType === 3) {
      question.content = `<p>${content}</p>`;
    } else {
      // question.content = content;
      question.content = `<p>${content}</p>`;
    }
    question.solution = this.questionSolution._results[index].nativeElement.innerHTML;
    return;
  }

   // img 标签 转为 mathml
   private getMathMl(content) {
    // console.log(content);
  }

  // 根据是否材料题分别按题型获取数据
  private handleSubmit(question: any, isSingle?: boolean): void {
    if (isSingle) {
      this.traverseQuestionType(question);
    } else {
      this.traverseQuestionType(question.questions);
    }
  }

  // 遍历不同题型获取要提交的数据
  private traverseQuestionType(question: any): void {
    let blankIndex = 0;
    let qaIndex = 0;
    let optionIndex = 0;
    question.forEach((q, qIndex) => {
      if (q.type === 10001 || q.type === 10002 || q.type === 10003) {
        for (let i = 0, len = q.options.length; i < len; i++) {
          q.options[i] = this.questionOption._results[optionIndex].nativeElement.innerHTML;
          optionIndex++;
        }
      }
      // 获取填空题答案
      if (q.type === 10005 || q.type === 10006) {
        for (let i = 0, len = q.answer.length; i < len; i++) {
          // q.answer[i] = this.questionBlankAnswer._results[blankIndex].nativeElement.innerHTML;
          const el = <HTMLInputElement>document.getElementById(`edit-question-answer-${qIndex}-${i}`);
          q.answer[i] = el.innerHTML;
          blankIndex++;
        }
      }
      if (q.type === 10007) {
        q.answer = this.questionAnswer._results[qaIndex].nativeElement.innerHTML;
        qaIndex++;
      }
    });
  }

  public onSubmit(): void {
    let postQuestion: any;
    // 材料题
    // if (this.question.questions.length > 1) {
    if (!this.questionTypes.some(type => type.id === this.question.type)) {
      postQuestion = _.cloneDeep(this.question);
      if (this.questionsContent) {
        postQuestion.content = `<p>${this.questionsContent.nativeElement.innerHTML}</p>`;
        // postQuestion.content = this.questionsContent.nativeElement.innerHTML;
      }
      postQuestion.questions.forEach((question, index) => {
        this.handleSubmitQuestion(question, index);
      });
      this.handleSubmit(postQuestion, false);
      // if (this.editType === 3) {
      //   let postData = postQuestion.questions
      //   postData.forEach((value, insertIndex) => this.setPostQuestion(value, insertIndex))
      // } else {
      //   this.setPostQuestion(postQuestion, 0)
      // }
      this.setPostQuestion(postQuestion, 0);
    // 非材料题
    } else {
      postQuestion = _.cloneDeep(this.question.questions);
      postQuestion.forEach((question, index) => {
        this.handleSubmitQuestion(question, index);
        this.handleSubmit(postQuestion, true);
      });
      if (this.editType === 3) {
        // 插入试题验证
        let result = 0;
        let isOnce = true;
        postQuestion.forEach((value, insertIndex) => {
          let validateResult = false;
          if (isOnce) {
            validateResult = this.validateQuestion(value, insertIndex);
            if (!validateResult) {
              isOnce = false;
            }
          }
          if (!isOnce) {
            return;
          }
          if (validateResult) {
            result++;
          }
        });
        if (result === postQuestion.length) {
          // 插入试题逐题保存
          postQuestion.forEach(question => {
            question.newType = 3;
            this.setSuitQuestion(question);
          });
        }
      } else {
        const postData = postQuestion[0];
        this.setPostQuestion(postData, 0);
      }
    }
  }

  // 单题和材料题验证
  private setPostQuestion(postData: Question, insertIndex: number): void {
    let result = true;
    if (!this.questionTypes.some(type => type.id === postData.type)) {
      // 材料题材料验证
      const textLen = _.trim(this.questionsContent.nativeElement.innerText).length;
      if (textLen < 2) {
        const el = this.questionsContent.nativeElement.parentNode.parentNode;
        this.scrollElementRef.nativeElement.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
        this.addWarnBorder(el);
        return;
      }
      // 材料题小题验证
      let validateIndex = 0;
      postData.questions.forEach((question, questionIndex) => {
        result = this.validateQuestion(question, questionIndex);
        if (result) {
          validateIndex++;
        }
      });
      if (validateIndex !== postData.questions.length) {
        return;
      }
    } else {
      result = this.validateQuestion(postData, insertIndex);
    }
    if (!result) {
      return;
    }
    // 材料题和非材料题调用不同的接口
    if (!this.questionTypes.some(type => type.id === postData.type)) {
      postData.newType = this.handleNewType();
      this.setSuitLargeQuestion(postData);
    } else {
      postData.newType = this.handleNewType();
      this.setSuitQuestion(postData);
    }
  }

  // 编辑 1 改变 2 插入 3
  private handleNewType(): number {
    if (this.editType === 1) {
      return 1;
    } else if (this.editType === 2) {
      return 2;
    } else if (this.editType === 3) {
      return 3;
    }
  }

  // 提交材料题数据，插入试题不能插入材料题
  private setSuitLargeQuestion(postData: Question): void {
    postData.courseId = this.editCourseId;
    if (postData.type >= 10010 && postData.type < 10016) {
      postData.type = 10010;
    }
    const setQuestion = JSON.stringify(postData);
    this.setSuitLargeSub = this.previewPaperService.setSuitLargeQuestion(this.teacherId, this.accessToken, setQuestion)
      .subscribe(response => {
      if (response.F_responseNo === 10000) {
        this.messageService.sendPromptMessage('保存试题成功');
        this.editQuestion.id = response.F_new_id;
        this.refreshQuestion.emit(true);
        this.isCloseEditDialog.emit(false);
      } else {
        this.messageService.sendPromptMessage('保存试题失败');
      }
    });
  }


  // 提交小题数据
  private setSuitQuestion(postData: Question): void {
    postData.courseId = this.editCourseId;
    const setQuestion = JSON.stringify(postData);
    this.setSuitQuestionSub = this.previewPaperService.setSuitQuestion(this.teacherId, this.accessToken, setQuestion)
      .subscribe(response => {
      if (response.F_responseNo === 10000) {
        this.messageService.sendPromptMessage('保存试题成功');
        this.postCount ++;
        if (this.question.questions.length === this.postCount) {
          this.refreshQuestion.emit(true);
          this.isCloseEditDialog.emit(false);
        } else {
          this.messageService.sendPromptMessage('保存试题失败');
        }
      }
    });
  }

  // 单题或小题验证
  private validateQuestion(question: Question, index: number): boolean {
    const scrollEl = this.scrollElementRef.nativeElement;
    // 插入试题验证分数
    if (this.editType === 3 && !question.score) {
      const el = document.getElementById(`setScore${index}`);
      scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
      this.addWarnBorder(el);
      return false;
    }
    let content = '';
    if (question.type === 10005 || question.type === 10006) {
      content = document.getElementById(`edit-question-title-${index}`).innerText;
    } else {
      content = document.getElementById(`content${index}`).innerText;
    }
    // 题干验证 完型填空不验证
    const temp = content.trim();
    const type = question.type;
    if (temp.length < 1 && this.editChapterTypeName !== '完型填空') {
      let el: HTMLElement;
      if (type === 10005 || type === 10006 ) {
        el = document.getElementById(`edit-question-title-${index}`).parentElement;
      } else {
        el = document.getElementById(`questionContent${index}`);
      }
      scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
      this.addWarnBorder(el);
      return false;
    }
    // 验证选项
    if (type === 10001 || type === 10002 || type === 10003) {
      let fail = false;
      question.options.forEach(option => {
        if (!option) {
          fail = true;
        }
      });
      if (fail) {
        const el = document.getElementById(`questionOption${index}`);
        scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
        this.addWarnBorder(el);
        return false;
      }
    }
    // 验证答案
    if (type === 10001 || type === 10004 || type === 10007) {
      if (question.answer === '') {
        const el = document.getElementById(`questionAnswer${index}`);
        scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
        this.addWarnBorder(el);
        return false;
      }
    }
    if (type === 10002) {
      if (question.answer.length < 2) {
        const el = document.getElementById(`questionAnswer${index}`);
        scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
        this.addWarnBorder(el);
        return false;
      }
    }
    if (type === 10003) {
      if (question.answer.length === 0) {
        const el = document.getElementById(`questionAnswer${index}`);
        scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
        this.addWarnBorder(el);
        return false;
      }
    }
    // 验证知识点
    if (!question.keypoints.length) {
      const el = document.getElementById(`questionKeyPoint${index}`);
      scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
      this.addWarnBorder(el);
      return false;
    }
    // 验证解析
    if (!question.solution) {
      const el = document.getElementById(`questionSolution${index}`);
      scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
      this.addWarnBorder(el);
      return false;
    }
    // 验证填空题
    if (type === 10005 || type === 10006) {
      let failIndex = 0;
      question.answer.forEach((answer, aIndex) => {
        const element = <HTMLInputElement>document.getElementById(`edit-question-answer-${index}-${aIndex}`);
        if (element.innerHTML) {
          failIndex++;
        }
      });
      if (question.answer.length !== failIndex || (question.answer.length === 0)) {
        // const el = document.getElementById(`questionBlankAnswer${index}`);
        const el = document.getElementById(`edit-question-answer-${index}`);
        scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
        this.addWarnBorder(el);
        return false;
      }
    }
    if (this.editType === 2 && (this.oldChangeType === question.type)) {
      const el = document.getElementById(`selectType${index}`);
      scrollEl.scrollTo({'behavior': 'smooth', 'top': el.offsetTop - this.OFFSET_TOP});
      this.addWarnBorder(el);
      return false;
    }
    return true;
  }

  private addWarnBorder(el: Element): void {
    this.rd.addClass(el, 'warn-border');
    setTimeout(() => {
      this.rd.removeClass(el, 'warn-border');
    }, 2000);
  }

  /**
   * 知识点
   */
  private getKeyPoints(): void {
    this.getKeyPointsSub =
    this.paperService.getKeyPoints(this.teacherId, this.accessToken, this.subjectId, true, this.stageId, this.bookId, this.special)
    .subscribe(response => {
      if (!response.F_list) { return; }
      this.keyPointList = this.parseJson(response.F_list);
      this.keyPoints = {
        value: 'root',
        children: this.keyPointList
      };
    });
  }

  public onNodeSelected(e: NodeEvent, questionIndex: number): void {
    const oopNodeController = this.treeComponent.getControllerByNodeId(e.node.id);
    if (e.node.isNodeExpanded()) {
      oopNodeController.collapse();
    } else {
      oopNodeController.expand();
    }
    let flag = false;
    if (e.node.children && e.node.children.length) {
      return;
    }
    this.question.questions[questionIndex].keypoints.forEach(keypoint => {
      // 备课本知识点插入数据库时加一百万
      if (keypoint.id === e.node.id || (keypoint.id === (+e.node.id + 1000000))) {
        flag = true;
      }
    });
    if (flag) {
      return;
    }
    const keyPoint = {
      id: +(e.node.id),
      name: e.node.value.toString(),
      type: 0
    };
    this.question.questions[questionIndex].keypoints.push(keyPoint);
  }

  public removeKeyPoint(keyPoint: any, questionIndex: number): void {
    const keypoints = this.question.questions[questionIndex].keypoints;
    const index = keypoints.indexOf(keyPoint);
    keypoints.splice(index, 1);
  }

  // 材料题只能改变小题的题型
  // 改变题型
  /**
   *
   */
  public selectType(typeId: number, questionIndex: number): void {
    const question = this.question.questions[questionIndex];
    let element: HTMLElement;
    const preType = question.type;
    let preElement: HTMLElement;
    if (typeId === question.type) {
      return;
    } else {
      question.type = typeId;
    }
    if (preType === 10005 || preType === 10006) {
      preElement = document.getElementById(`edit-question-title-${questionIndex}`);
      question.content = `<p>${preElement.innerHTML}</p>`;
      question.content = question.content.replace(/\<pos.*?\>(\d{1,2}\<\/pos\>)/g, '');
    } else {
      preElement = document.getElementById(`content${questionIndex}`);
      question.content = `<p>${preElement.innerHTML}</p>`;
    }
    setTimeout(() => {
      if (typeId === 10005 || typeId === 10006) {
        element = document.getElementById(`edit-question-title-${questionIndex}`);
      } else {
        element = document.getElementById(`content${questionIndex}`);
      }
      // 单选多选不定项切换 选项保留 答案清空
      if (typeId === 10001) {
        question.answer = '';
        if (!question.options || !question.options.length || question.options.every(option => option === '')) {
          question.options = ['', '', ''];
        }
      }
      if (typeId === 10002 || typeId === 10003) {
        question.answer = [];
        if (!question.options || !question.options.length || question.options.every(option => option === '')) {
          question.options = ['', '', '', ''];
        }
      }
      // 客观/主观切换答题线保留，答案清空
      if (typeId === 10005 || typeId === 10006) {
        if (question.options && question.options.length) {
          question.answer = [];
        }
        question.options = [];
        if (_.isArray(question.answer) && question.answer.length) {
          question.answer.forEach(answer => answer = '');
        } else {
          // if (element.innerText && element.innerText.length < 1) {
          //   element.innerHTML = '<p></p>';
          // }
          question.answer = [];
        }
      }
      // 其余情况选项和答案清空
      if (typeId === 10004) {
        question.options = ['', ''];
        question.answer = '';
      }
      if (typeId === 10007) {
        question.options = [];
        question.answer = '';
      }
    }, 10);
  }

  public selectDifficulty(difficultyId: number, questionIndex): void {
    const question = this.question.questions[questionIndex];
    question.difficulty = difficultyId;
  }

  // 递归遍历更改 key 值
  private parseJson(arr: KeyPoint[]): KeyPoint[] {
    const treeSettings = {
      isCollapsedOnInit: true,
      cssClasses: {
        expanded: 'fa fa-caret-down',
        collapsed: 'fa fa-caret-right',
        leaf: 'fa'
      }
    };
    arr = _.cloneDeep(arr);
    function toParse(a) {
        a.forEach(item => {
            item['id'] = item.F_id;
            item['value'] = item.F_name;
            item['settings'] = treeSettings;
            if (item.F_children && _.isArray(item.F_children)) {
                item['children'] = item.F_children;
                toParse(item['children']);
            }
            delete item.F_id;
            delete item.F_name;
            delete item.F_children;
        });
        return a;
    }
    return toParse(arr);
  }

  public transformDifficulty(difficulty: number): number {
    if (difficulty < 2.5) {
      return 2;
    } else if (difficulty >= 2.5 && difficulty < 4.0) {
      return 3;
    } else if (difficulty >= 4.0 && difficulty < 5.1) {
      return 4.5;
    } else if (difficulty >= 5.1 && difficulty < 7.0) {
      return 6;
    } else {
      return 8;
    }
  }

  public openCKEditor(ev: Event, key: string, type?: number): void {
    if (_.indexOf(this.editorKeys, key) > -1) {
      this.editorKeys.push(key);
    } else {
      try {
        CKEDITOR.inline(ev.currentTarget);
        this.editorKeys.push(key);
      } catch (error) {

      }
    }
  }

  ngOnDestroy() {
    try {
    const editors = CKEDITOR.instances;
      for (const key of Object.keys(editors)) {
        editors[key].destroy();
      }
      this.editorKeys = [];

      if (this.setSuitLargeSub) {
        this.setSuitLargeSub.unsubscribe();
      }
      if (this.getKeyPointsSub) {
        this.getKeyPointsSub.unsubscribe();
      }
      if (this.setSuitQuestionSub) {
        this.setSuitQuestionSub.unsubscribe();
      }
    } catch (error) {

    }
  }
}
