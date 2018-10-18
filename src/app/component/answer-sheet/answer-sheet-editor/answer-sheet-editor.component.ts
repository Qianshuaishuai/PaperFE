import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AnswerSheet } from '../data/answerSheet';
import { AnswerSheetOption } from '../data/answerSheetOption';

import { AnswerSheetService } from '../service/answer-sheet.service';
import { DataService } from '../service/data.service';
import { MessageService } from '../../../service/message.service';
import { PaperService } from '../../../service/paper.service';
import { PropertyService } from '../../../service/property.service';
import { QuestionsService } from '../service/questions.service';

import html2pdf from 'html2pdf.js';
import * as _ from 'lodash';

@Component({
  selector: 'app-answer-sheet-editor',
  templateUrl: './answer-sheet-editor.component.html',
  styleUrls: ['./answer-sheet-editor.component.scss']
})
export class AnswerSheetEditorComponent implements OnInit, OnDestroy {
  // 编辑模式，true为下载模式，false为制作模式
  isDownloadMode: boolean;
  modeCode: string;

  // 添加题目
  isAddNonMarkSubQuestion = false;
  isSetComposition = false;
  isShowAddQuestionConfig = false;
  addBlankCount = 5;
  addGridCount = 900;
  addLineCount = 20;
  addOptionCount = 4;
  addQuestions: { name: string, indexStart: number, indexEnd: number }[] = [];
  addQuestionIndex: any[] = [];
  addQuestionIndexEnd = 1;
  addQuestionIndexStart = 1;
  addQuestionTitle: string;
  addQuestionType: number;
  // 制作的答题卡模式添加的大题标题
  private titles: string[] = [];

  // 试题数据相关
  private paperId: number;
  paperQuestionSetChapter;
  questions;
  private courseId: number;
  private paperCourseId: number; // 当前试卷的科目
  private teacherId: string;
  private accessToken: string;
  private gradeId;
  paperTitle: string;
  attention = '';

  // 答题卡相关
  answerSheets: AnswerSheet[];
  option: AnswerSheetOption = {
    col: 1,
    candidateNumberType: false,
    judgementType: true,
    noAnswerZone: false,
    sortByOrder: false,
  };

  // 选择题每列行数
  currentGroupCapacity = 5;
  groupCapacityOptions: number[] = [1, 2, 3, 4, 5];
  groupCapacity = 5;
  isShowGroupCapacitySetting = false;

  // 预览
  preview: Element;
  showPreview = false;

  // 页脚
  isShowPageIndex = false;

  // 数据是否完整
  isTitleOverflow = false;
  isTitleEmpty = false;
  isAttentionOverflow = false;
  isPageOverflow = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private answerSheetService: AnswerSheetService,
    private dataService: DataService,
    private messageService: MessageService,
    private paperService: PaperService,
    private propertyService: PropertyService,
    private questionsService: QuestionsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    this.gradeId = this.propertyService.readGradeId();
    this.modeCode = this.activateRoute.snapshot.params['mode'];
    this.isDownloadMode = this.modeCode === '1' || this.modeCode === '2' ? true : false;
    this.courseId = this.propertyService.readOldSubjectId();
    this.paperId = this.activateRoute.snapshot.params['paperId'];
    switch (this.modeCode) {
      case '0':
        this.refresh();
        break;
      case '1':
      case '2':
        this.getSavedData();
        break;
    }
    this.preview = document.querySelector('#preview');
  }

  ngOnDestroy(): void {
    this.questionsService.cleanUp();
  }

  // 获取潜在的已保存答题卡数据
  private getSavedData(): void {
    this.dataService.getAnswerSheetData(this.teacherId, this.accessToken, this.paperId.toString()).subscribe(res => {
      if (res.F_responseNo === 10000) {
        // console.log(res);
        if (Object.prototype.toString.call(res.F_data) === '[object String]') {
          switch (this.modeCode) {
            case '1':
              this.getPaperInfo();
              break;
            case '2':
              this.getBasketData();
              break;
          }
        } else {
          this.paperTitle = res.F_data.paperTitle;
          this.option = res.F_data.option;
          this.questionsService.setQuestions(res.F_data.questions);
          this.questionsService.setPreQuestions(res.F_data.preQuestions);
          this.questionsService.setBreakPoints(res.F_data.breakPoints);
          this.attention = res.F_data.attention;
          this.refresh();
          this.questions = this.questionsService.getPreQuestions();
        }
      }
    });
  }

  // 获取从套卷或同步试卷直接进入下载答题卡的试卷数据
  private getBasketData(): void {
    this.dataService.getPaperListBasketData(this.teacherId, this.courseId, true, this.paperId).subscribe(response => {
      if (response.F_responseNo === 10000) {
        // console.log(response);
        // 这不是多此一举，这是为了绕开类型检测
        const res: any = _.cloneDeep(response);
        this.paperTitle = res.F_title;
        this.paperCourseId = res.F_course_id;
        this.paperQuestionSetChapter = {
          questionSet: {
            paperQuestionSetChapters: _.cloneDeep(response.F_data)
          }
        };
        switch (this.paperCourseId) {
          // 语文
          case 12:
          case 30:
          case 42:
          case 53:
          case 70:
            this.questionsService.setChineseQuestion(this.paperQuestionSetChapter, this.paperCourseId);
            break;
          // 英语
          case 15:
          case 32:
          case 44:
          case 55:
          case 72:
            this.questionsService.setEnglishQuestion(this.paperQuestionSetChapter, this.paperCourseId);
            break;
          default:
            this.questionsService.setOtherQuestion(this.paperQuestionSetChapter, this.paperCourseId);
        }
        this.questionsService.generateQuestions(false, true, this.currentGroupCapacity);
        this.refresh();
        this.questions = this.paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
      } else {
        this.messageService.sendPromptMessage('无法获取试题数据，请稍后重试');
      }
    });
  }

  // 获取试题数据
  private getPaperInfo(): void {
    this.paperCourseId = this.propertyService.readSubjectId();
    this.paperService.getPaperInfo(this.paperId, true).subscribe(response => {
      if (response.F_responseNo === 10000) {
        // console.log(response.F_info.F_data);
        this.paperTitle = response.F_info.F_data.name;
        this.paperQuestionSetChapter = _.cloneDeep(response.F_info.F_data);
        switch (this.paperCourseId) {
          // 语文
          case 12:
          case 30:
          case 42:
          case 53:
          case 70:
            this.questionsService.setChineseQuestion(this.paperQuestionSetChapter, this.paperCourseId);
            break;
          // 英语
          case 15:
          case 32:
          case 44:
          case 55:
          case 72:
            this.questionsService.setEnglishQuestion(this.paperQuestionSetChapter, this.paperCourseId);
            break;
          default:
            this.questionsService.setOtherQuestion(this.paperQuestionSetChapter, this.paperCourseId);
        }
        this.questionsService.generateQuestions(false, true, this.currentGroupCapacity);
        this.refresh();
        this.questions = this.paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
      } else {
        this.messageService.sendPromptMessage('无法获取试题数据，请稍后重试');
      }
    });
  }

  // 刷新页面数据
  private refresh(): void {
    this.answerSheets = this.answerSheetService.generateAnswerSheets(this.option, this.questionsService.getQuestions());
  }

  // 刷新预览数据
  private refreshPreview(): void {
    const as = document.querySelectorAll('.answerSheet');
    let previewWidth = 0;
    let previewHeight = 0;
    // 根据答题卡栏数生成
    switch (this.option.col) {
      case 1:
        previewWidth = 210;
        previewHeight = this.answerSheets.length * 297;
        break;
      case 2:
        previewWidth = 420;
        previewHeight = this.answerSheets.length / 2 * 297;
        break;
      case 3:
        previewWidth = 420;
        previewHeight = this.answerSheets.length / 3 * 297;
        break;
    }
    this.preview.setAttribute('style', `height: ${previewHeight}mm; width: ${previewWidth}mm;`);
    if (this.preview.childNodes) {
      while (this.preview.firstChild) {
        this.preview.removeChild(this.preview.firstChild);
      }
    }
    for (let i = 0; i !== this.answerSheets.length; i++) {
      this.preview.appendChild(as[i].cloneNode(true));
    }
    this.simplifyPreview();
  }

  private simplifyPreview(): void {
    this.preview.innerHTML = this.preview.innerHTML.replace(/contenteditable/g, '');
    const ignore = document.querySelectorAll('#preview *[data-html2canvas-ignore]');
    for (let i = 0; i !== ignore.length; i++) {
      ignore[i].parentNode.removeChild(ignore[i]);
    }
  }

  // 表单验证
  private validate(): boolean {
    return this.validateQuestionTitle() && // 标题
      this.validateQuestionIndex() && // 题号
      this.validateOptionCount() && // 选项个数
      this.validateBlankCount() && // 每行空数
      this.validateGridCount() && // 作文格数
      this.validateLineCount(); // 作文行数
  }

  private validateQuestionTitle(): boolean {
    if (this.isAddNonMarkSubQuestion) {
      return true;
    }
    // 若为空
    if (this.addQuestionTitle === '') {
      this.setWarning('#questionTitle', '标题不能为空');
      return false;
    }
    // 若重复
    if (this.titles.indexOf(this.addQuestionTitle) !== -1) {
      this.setWarning('#questionTitle', '标题不能重复');
      return false;
    }
    if (this.isMarkQuestion() && this.titles.indexOf(this.addQuestionTitle + 'isMark') !== -1) {
      this.setWarning('#questionTitle', '标题不能重复');
      return false;
    }
    return true;
  }

  private validateQuestionIndex(): boolean {
    // 若为空
    if (!this.addQuestionIndexStart) {
      this.setWarning('#questionIndexStart', '开始题号不能为空');
      return false;
    }
    if (this.addQuestionType !== 0 && this.addQuestionType !== 1) {
      if (!this.addQuestionIndexEnd) {
        this.setWarning('#questionIndexEnd', '结束题号不能为空');
        return false;
      }
    }
    // 若结束小于开始
    if (this.addQuestionType !== 0 && this.addQuestionType !== 1) {
      if (+this.addQuestionIndexStart > +this.addQuestionIndexEnd) {
        this.setWarning('#questionIndexEnd', '结束题号不能小于开始题号');
        return false;
      }
    }
    // 若题目数量太多
    if (+this.addQuestionIndexEnd - +this.addQuestionIndexStart > 149) {
      this.setWarning('#questionIndexStart', '');
      this.setWarning('#questionIndexEnd', '一次不能添加超过150道题目');
      return false;
    }
    // 若题号重复
    for (let i = 0; i !== this.addQuestionIndex.length; i++) {
      if (+this.addQuestionIndexEnd < +this.addQuestionIndex[i].start || +this.addQuestionIndexStart > +this.addQuestionIndex[i].end) {
        continue;
      } else {
        this.setWarning('#questionIndexStart', '题号不能重复');
        if (this.addQuestionType !== 0 && this.addQuestionType !== 1) {
          this.setWarning('#questionIndexEnd', '题号不能重复');
        }
        return false;
      }
    }
    return true;
  }

  private validateOptionCount(): boolean {
    // 若非选择题
    if (this.addQuestionType < 10001 || this.addQuestionType > 10004 ) {
      return true;
    }
    // 若为空
    if (!this.addOptionCount) {
      this.setWarning('#optionCount', '选项个数不能为空');
      return false;
    }
    // 若非法
    if (+this.addOptionCount < 2) {
      this.setWarning('#optionCount', '选项个数最小为2');
      return false;
    }
    if (+this.addOptionCount > 10) {
      this.setWarning('#optionCount', '选项个数最大为10');
      return false;
    }
    return true;
  }

  private validateBlankCount(): boolean {
    // 若为空
    if (!this.addBlankCount) {
      this.setWarning('#blankCount', '每行空数不能为空');
      return false;
    }
    // 若非法
    if (+this.addBlankCount < 1) {
      this.setWarning('#blankCount', '每行空数最小为1');
      return false;
    }
    if (+this.addBlankCount > 5) {
      this.setWarning('#blankCount', '每行空数最大为5');
      return false;
    }
    return true;
  }

  private validateGridCount(): boolean {
    // 若为空
    if (!this.addGridCount) {
      this.setWarning('#gridCount', '作文格数不能为空');
      return false;
    }
    // 若非法
    if (+this.addGridCount < 300) {
      this.setWarning('#gridCount', '作文格数最小为300');
      return false;
    }
    if (+this.addGridCount > 2000) {
      this.setWarning('#gridCount', '作文格数最大为2000');
      return false;
    }
    return true;
  }

  private validateLineCount(): boolean {
    // 若为空
    if (!this.addLineCount) {
      this.setWarning('#lineCount', '作文行数不能为空');
      return false;
    }
    // 若非法
    if (+this.addLineCount < 1) {
      this.setWarning('#lineCount', '作文行数最小为1');
      return false;
    }
    if (+this.addLineCount > 20) {
      this.setWarning('#lineCount', '作文行数最大为20');
      return false;
    }
    return true;
  }

  private setWarning(element: string, warningMsg: string): void {
    const warning = document.querySelector('.warning');
    warning.innerHTML = warningMsg;
    const ele = document.querySelector(element);
    ele.setAttribute('class', 'error');
  }

  // 移除题号
  private removeIndex(removeIndex): void {
    for (let i = 0; i !== this.addQuestionIndex.length; i++) {
      const originStart = this.addQuestionIndex[i].start;
      const originEnd = this.addQuestionIndex[i].end;
      if (removeIndex > originStart && removeIndex < originEnd) {
        this.addQuestionIndex.splice(i, 1,
          { start: originStart, end: removeIndex - 1 },
          { start: removeIndex + 1, end: originEnd }
        );
        break;
      }
      if (removeIndex === originStart && removeIndex === originEnd) {
        this.addQuestionIndex.splice(i, 1);
        break;
      }
      if (removeIndex === originStart && removeIndex !== originEnd) {
        this.addQuestionIndex[i].start++;
      }
      if (removeIndex !== originStart && removeIndex === originEnd) {
        this.addQuestionIndex[i].end--;
      }
    }
  }

  /* 答题卡栏 */

  // 显示试卷标题
  getPaperTitle(): string {
    return this.isDownloadMode ? this.paperQuestionSetChapter.name : '从入口获取';
  }

  // 选择题每列行数
  setDisplayedGroupCapacity(n): void {
    this.groupCapacity = n;
  }

  setGroupCapacity(): void {
    this.currentGroupCapacity = this.groupCapacity;
    const isThreeCol = this.option.col === 3 ? true : false;
    this.questionsService.regenerateMarkQuestion(isThreeCol, this.option.judgementType, this.currentGroupCapacity);
    this.refresh();
    this.isShowGroupCapacitySetting = false;
  }

  hideGroupCapacitySetting(): void {
    this.isShowGroupCapacitySetting = false;
    this.groupCapacity = this.currentGroupCapacity;
  }

  onShowGroupCapacitySetting(event: any): void {
    this.isShowGroupCapacitySetting = event;
  }

  // 拉伸答题框
  onResizeSubQuestion(event: any): void {
    this.questionsService.resizeSubQuestion(event);
    this.refresh();
  }

  // 保存各修改
  // 答题框
  onAutoSave(event): void {
    this.questionsService.saveContent(event.questionTitle, event.subQuestionIndex, event.innerHtml, event.height, event.partIndex);
  }

  onAttentionChange(event): void {
    this.attention = event;
    this.isAttentionOverflow = false;
  }

  onAttentionOverflow(): void {
    this.messageService.sendPromptMessage('输入内容过多，请删减');
    this.isAttentionOverflow = true;
  }

  // 大题标题
  onQuestionTitleChange(event): void {
    this.questionsService.renameQuestion(event.oldTitle, event.newTitle);
  }

  // 标题
  onTitleChange(event): void {
    if (!event) {
      this.messageService.sendPromptMessage('请输入标题');
      this.isTitleEmpty = true;
    } else {
      this.paperTitle = event;
      this.isTitleEmpty = false;
      this.isTitleOverflow = false;
    }
  }

  // 标题溢出
  onOverflow(): void {
    this.messageService.sendPromptMessage('标题不能超过两行，请删减');
    this.isTitleOverflow = true;
  }

  // 答题卡超过两张
  onSetPageOverflow(e): void {
    this.isPageOverflow = e;
  }


  /* 编辑栏相关 */

  /* 答题卡栏数 */
  setOneCol(): void {
    if (this.option.col !== 1) {
      this.option.col = 1;
      this.questionsService.regenerateMarkQuestion(false, this.option.judgementType, this.currentGroupCapacity);
      this.questionsService.regenerateChineseComposition(false);
      this.refresh();
    }
  }

  setTwoCol(): void {
    if (this.option.col !== 2) {
      this.option.col = 2;
      this.questionsService.regenerateMarkQuestion(false, this.option.judgementType, this.currentGroupCapacity);
      this.questionsService.regenerateChineseComposition(false);
      this.refresh();
    }
  }

  setThreeCol(): void {
    if (this.option.col !== 3) {
      this.option.col = 3;
      this.questionsService.regenerateMarkQuestion(true, this.option.judgementType, this.currentGroupCapacity);
      this.questionsService.regenerateChineseComposition(true);
      this.refresh();
    }
  }

  /* 考号版式 */
  turnOnCandidateNumberType(): void {
    if (!this.option.candidateNumberType) {
      this.option.candidateNumberType = true;
      this.refresh();
    }
  }

  turnOffCandidateNumberType(): void {
    if (this.option.candidateNumberType) {
      this.option.candidateNumberType = false;
      this.refresh();
    }
  }

  /* 禁止作答区 */
  turnOnNoAnswerZone(): void {
    if (!this.option.noAnswerZone) {
      this.option.noAnswerZone = true;
      this.refresh();
    }
  }

  turnOffNoAnswerZone(): void {
    if (this.option.noAnswerZone) {
      this.option.noAnswerZone = false;
      this.refresh();
    }
  }

  /* 添加题目 */
  // 相关布尔判断
  // 操作类型
  // 是添加大题
  isAddQuestion(): boolean {
    return !this.isAddNonMarkSubQuestion && !this.isSetComposition;
  }

  // 题目类型
  isChineseComposition(): boolean {
    return this.addQuestionType === 0;
  }
  isEnglishComposition(): boolean {
    return this.addQuestionType === 1;
  }
  isComposition(): boolean {
    return this.isChineseComposition() || this.isEnglishComposition();
  }

  isSingleChoiceQuestion(): boolean {
    return this.addQuestionType === 10001;
  }
  isMultiChoiceQuestion(): boolean {
    return this.addQuestionType === 10002 || this.addQuestionType === 10003;
  }
  isJudgementQuestion(): boolean {
    return this.addQuestionType === 10004;
  }
  isMarkQuestion(): boolean {
    return this.isSingleChoiceQuestion() || this.isMultiChoiceQuestion() || this.isJudgementQuestion();
  }

  isFillInQuestion(): boolean {
    return this.addQuestionType === 10005 || this.addQuestionType === 10006;
  }

  showAddQuestionConfig(questionType: number): void {
    this.setAddQuestionType(questionType);
    this.isShowAddQuestionConfig = true;
  }

  hideAddQuestionConfig(): void {
    this.isSetComposition = false;
    this.isAddNonMarkSubQuestion = false;
    this.isShowAddQuestionConfig = false;
  }

  setAddQuestionType(type: number): void {
    this.addQuestionType = type;
    switch (type) {
      case 10001:
      case 10002:
        this.addQuestionTitle = '选择题';
        this.addOptionCount = 4;
        break;
      case 10004:
        this.addQuestionTitle = '判断题';
        this.addOptionCount = 2;
        break;
      case 10005:
        this.addQuestionTitle = '填空题';
        break;
      case 10007:
        this.addQuestionTitle = '解答题';
        break;
      case 0:
      case 1:
        this.addQuestionTitle = '作文';
        break;
      default:
        this.addQuestionTitle = '解答题';
    }
  }

  addQuestion(): void {
    if (this.validate()) {
      this.addQuestionIndex.push(
        { start: +this.addQuestionIndexStart, end: +this.addQuestionIndexEnd,
          isMark: this.isMarkQuestion() }
      );
      if (!this.isAddNonMarkSubQuestion) {
        let title = this.addQuestionTitle;
        title += this.isMarkQuestion() ? 'isMark' : '';
        this.titles.push(title);
        this.addQuestions.push({
          name: this.addQuestionTitle,
          indexStart: +this.addQuestionIndexStart,
          indexEnd: +this.addQuestionIndexEnd
        });
      }
      const rawQuestion: any = {};
      rawQuestion.title = this.addQuestionTitle;
      rawQuestion.type = this.addQuestionType;
      rawQuestion.startIndex = +this.addQuestionIndexStart;
      rawQuestion.endIndex = +this.addQuestionIndexEnd;
      rawQuestion.optionCount = +this.addOptionCount;
      rawQuestion.gridCount = +this.addGridCount;
      rawQuestion.lineCount = +this.addLineCount;
      rawQuestion.blankCount = +this.addBlankCount;
      rawQuestion.isThreeCol = this.option.col === 3 ? true : false;
      rawQuestion.judgementType = this.option.judgementType;
      rawQuestion.groupCapacity = this.groupCapacity;
      if (!this.isAddNonMarkSubQuestion) {
        this.questionsService.addQuestion(rawQuestion);
      } else {
        this.questionsService.addNonMarkSubQuestion(rawQuestion);
      }
      this.refresh();
      this.isShowAddQuestionConfig = false;
      this.isAddNonMarkSubQuestion = false;
      this.addQuestionIndexStart = +this.addQuestionIndexEnd + 1;
      this.addQuestionIndexEnd = this.addQuestionIndexStart;
    }
  }

  setComposition(): void {
    if (this.addQuestionType === 0 && this.validateGridCount()) {
      const isThreeCol = this.option.col === 3 ? true : false;
      this.questionsService.resetChineseComposition(this.addQuestionTitle, +this.addGridCount, isThreeCol);
      this.refresh();
      this.isSetComposition = false;
      this.isShowAddQuestionConfig = false;
    } else if (this.addQuestionType === 1 && this.validateLineCount()) {
      this.questionsService.resetEnglishComposition(this.addQuestionTitle, +this.addLineCount);
      this.refresh();
      this.isSetComposition = false;
      this.isShowAddQuestionConfig = false;
    }
  }

  onAddMarkQuestion(): void {
    this.setAddQuestionType(10001);
    this.addQuestionTitle = this.questionsService.getQuestions()[0].title;
    this.isShowAddQuestionConfig = true;
  }

  onAddSubQuestion(event: any): void {
    this.addQuestionType = event.questionType;
    this.addQuestionTitle = event.questionTitle;
    this.isAddNonMarkSubQuestion = true;
    this.isShowAddQuestionConfig = true;
  }

  onRemoveMarkQuestion(): void {
    // 更新题号
    for (let i = 0; i !== this.addQuestionIndex.length; i++) {
      if (this.addQuestionIndex[i].isMark) {
        this.addQuestionIndex.splice(i, 1);
        i--;
      }
    }
    const questions = this.questionsService.getQuestions();
    // 去除标题
    for (let i = 0; i !== this.titles.length; i++) {
      if (this.titles[i].indexOf('isMark') !== -1) {
        this.titles.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i !== this.addQuestions.length; i++) {
      if (this.addQuestions[i].name === questions[0].title) {
        this.addQuestions.splice(i, 1);
        break;
      }
    }
    this.questionsService.removeMarkQuestion();
    this.refresh();
  }

  onRemoveSubQuestion(event: any): void {
    // 移除对应小题
    this.questionsService.removeSubQuestion(event);
    this.refresh();
    // 删除对应题号
    this.removeIndex(event.subQuestionIndex);
    // 若大题被删除则删除对应标题
    let isDeleted = true;
    const questions = this.questionsService.getQuestions();
    for (let i = 0; i !== questions.length; i++) {
      if (questions[i].title === event.questionTitle) {
        isDeleted = false;
        break;
      }
    }
    if (isDeleted) {
      this.titles.splice(this.titles.indexOf(event.questionTitle), 1);
      for (let i = 0; i !== this.addQuestions.length; i++) {
        if (this.addQuestions[i].name === event.questionTitle) {
          this.addQuestions.splice(i, 1);
          break;
        }
      }
    }
  }

  clearWarning(event: any): void {
    event.target.removeAttribute('class');
    const warning = document.querySelector('.warning');
    warning.innerHTML = '';
  }

  onSetComposition(params): void {
    this.addQuestionType = params.questionType;
    this.addQuestionTitle = params.questionTitle;
    this.isShowAddQuestionConfig = true;
    this.isSetComposition = true;
  }

  /* 题目列表 */
  showName(question): string {
    if (question.name.indexOf('选择题') !== -1) {
      return '选择题';
    } else {
      return question.name;
    }
  }

  showQuestionRange(question): string {
    let endIndexName = '';
    if (question.questionsContent.length !== 1) {
      endIndexName = '~' + question.questionsContent[question.questionsContent.length - 1].index;
    }
    return question.questionsContent[0].index + endIndexName;
  }

  showAddQuestionRange(question): string {
    const endIndexName = question.indexStart === question.indexEnd ? '' : ('~' + question.indexEnd);
    return question.indexStart + endIndexName;
  }

  /* 添加页脚 */
  toggleFooter(): void {
    this.isShowPageIndex = !this.isShowPageIndex;
  }

  /* 判断题样式 */
  toggleJudgementType(): void {
    this.option.judgementType = !this.option.judgementType;
    const isThreeCol = this.option.col === 3 ? true : false;
    this.questionsService.regenerateMarkQuestion(isThreeCol, this.option.judgementType, this.currentGroupCapacity);
    this.refresh();
  }

  /* 预览 */
  enterPreview(): void {
    this.refreshPreview();
    this.showPreview = true;
  }

  quitPreview(): void {
    this.showPreview = false;
  }

  // 返回试卷库
  returnToLib(): void {
    this.propertyService.writeSubjectId(this.courseId);
    // this.router.navigate([`/library/${this.courseId}/${this.gradeId}/fhtbsj/-1/0`]);
    this.router.navigate([`/library/${this.courseId}/${this.gradeId}/1/-1/0`]);
    // this.router.navigate([`/library/${this.courseId}/100/-1/0`]);
  }

  /* 下载 */
  downLoad(): void {
    if (!this.validateAnswerSheet()) {
      return;
    }
    const as = document.querySelectorAll('.answerSheet');
    let previewWidth = 0;
    let previewHeight = 0;
    const jsPdfOpt = { orientation: '', format: '' };
    switch (this.option.col) {
      case 1:
        jsPdfOpt.orientation = 'p';
        jsPdfOpt.format = 'a4';
        previewWidth = 210;
        previewHeight = this.answerSheets.length * 297 - 1;
        break;
      case 2:
        jsPdfOpt.orientation = 'l';
        jsPdfOpt.format = 'a3';
        previewWidth = 420;
        previewHeight = this.answerSheets.length / 2 * 297 - 1;
        break;
      case 3:
        jsPdfOpt.orientation = 'l';
        jsPdfOpt.format = 'a3';
        previewWidth = 420;
        previewHeight = this.answerSheets.length / 3 * 297 - 1;
        break;
    }
    const opt = {
      filename: document.querySelector('.headerEditor').innerHTML,
      // image: { type: 'jpeg', quality: 1 },
      image: { type: 'png', quality: 1 },
      html2canvas: { logging: false, scale: 2 },
      jsPDF: jsPdfOpt
    };
    const dl = document.createElement('div');
    dl.setAttribute('style', `height: ${previewHeight}mm; width: ${previewWidth}mm;`
      + 'margin: 0; padding: 0; display: flex; flex-wrap: wrap;');
    for (let i = 0; i !== this.answerSheets.length; i++) {
      dl.appendChild(as[i].cloneNode(true));
    }
    let innerHtml = dl.innerHTML.toString();
    innerHtml = innerHtml.replace(/\<u\s.*?\>/g, '<span style="border-bottom: 1px solid; border-left: 0; border-right: 0;">');
    innerHtml = innerHtml.replace(/\<\/u\>/g, '</span>');
    dl.innerHTML = innerHtml;
    html2pdf().from(dl).set(opt).then(() => {
      // console.log('en');
      this.messageService.sendPromptMessage('即将开始下载');
    }).save();
  }

  /* 直接打印 */
  print(): void {
    if (!this.validateAnswerSheet()) {
      return;
    }
    this.enterPreview();
    const container = document.querySelector('.container');
    const containerWidth = this.option.col === 1 ? 210 : 420;
    container.setAttribute('style', `width: ${containerWidth}mm;`);
    const questionIndex_All = document.querySelectorAll('#preview .questionIndex');
    for (let i = 0 ; i !== questionIndex_All.length; i++) {
      questionIndex_All[i].setAttribute('style', 'display: none;');
    }
    const headerBorder_All = document.querySelectorAll('#preview .border');
    for (let i = 0; i !== headerBorder_All.length; i++) {
      headerBorder_All[i].setAttribute('style', 'display: none;');
    }
    const head = document.querySelector('head');
    const printPageStyle = document.createElement('style');
    printPageStyle.setAttribute('type', 'text/css');
    printPageStyle.setAttribute('media', 'print');
    const orientation = this.option.col === 1 ? 'portrait' : 'landscape';
    printPageStyle.innerHTML = `@page { size: ${orientation}; margin: 0; }`;
    head.appendChild(printPageStyle);
    window.print();
    head.removeChild(head.childNodes[head.childNodes.length - 1]);
    container.removeAttribute('style');
    this.quitPreview();
  }

  // 保存答题卡
  saveAnswerSheet(): void {
    const jsonDataObj = {
      paperTitle: this.paperTitle,
      option: this.option,
      questions: this.questionsService.getQuestions(),
      preQuestions: this.questionsService.getPreQuestions(),
      breakPoints: this.questionsService.getBreakPoints(),
      attention: this.attention,
    };
    const jsonData = JSON.stringify(jsonDataObj);
    this.dataService.saveAnswerSheetData(this.teacherId, this.accessToken, this.paperId.toString(), jsonData).subscribe(res => {
      if (res.F_responseNo === 10000) {
        this.messageService.sendPromptMessage('保存成功');
      } else {
        this.messageService.sendPromptMessage('发生未知错误，请稍后重试');
      }
    });
  }

  // 完整性检查
  // 标题是否为空
  // 标题是否超容
  // 注意事项是否超容
  // 是否超过两张纸
  private validateAnswerSheet(): boolean {
    if (this.isTitleEmpty) {
      this.messageService.sendPromptMessage('请输入标题');
      return false;
    } else if (this.isTitleOverflow) {
      this.messageService.sendPromptMessage('标题内容不能超过两行，请删减');
      return false;
    } else if (this.isAttentionOverflow) {
      this.messageService.sendPromptMessage('注意事项内容过多，请删减');
      return false;
    } else if (this.isPageOverflow) {
      this.messageService.sendPromptMessage('答题卡内容最多支持2张，请重新调整布局');
      return false;
    } else {
      return true;
    }
  }

}
