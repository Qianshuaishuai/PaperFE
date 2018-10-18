import { Component, OnInit, OnDestroy, Renderer2, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { SwitchBookService } from '../../../service/switch-book.service';
import { Stage, Book, Chapter } from '../../../bean/switch';
import { Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { PaperService } from '../../../service/paper.service';
import { PropertyService } from '../../../service/property.service';
import { PaperQuestionSetChapter, Question } from '../../details/paper-details/data/paperDetailsResponse';
import { CommonService } from '../../../service/common.service';
import { Utils } from '../../../utils';
import { MessageService } from '../../../service/message.service';
import { LoaderService } from '../../../service/loader.service';
import { LoaderState } from '../../../bean/loader-state';
import { ChangeScore } from '../../../bean/change-score';
import { CLOZE, SEVEN_SELECT_FIVE, SUCCESS, PREVIEW_PAPER_DELETE_QUESTION, SAVE_PAPER } from '../../../constants';
import { StageResponse, SubjectResponse, BookenameResponse, BookResponse } from '../../../response/switch-response';
import { SavePaper, Paper, Score, QuestionSet, Structure } from '../../../bean/save-paper';
import { PaperType } from '../../../bean/paper-type';
import { SelectorService } from '../../../service/selector.service';
import { SavePaperResponse } from '../../../response/save-paper-response';
import { DragulaService } from 'ng2-dragula/components/dragula.provider';
import { SaveEdit } from '../../../bean/save-edit';
import * as _ from 'lodash';
import { QuestionsBasket } from '../../../response/question-basket-response';

@Component({
  selector: 'app-preview-paper',
  templateUrl: './preview-paper.component.html',
  styleUrls: ['./preview-paper.component.scss']
})
export class PreviewPaperComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('editChapterName')
  editChapterName: ElementRef;
  @ViewChild('editChapterDetail')
  editChapterDetail: ElementRef;

  @ViewChild('mainTitle')
  mainTitle: ElementRef;
  @ViewChild('subTitle')
  subTitle: ElementRef;
  @ViewChild('paperMarking')
  paperMarking: ElementRef;
  @ViewChild('paperInfo')
  paperInfo: ElementRef;
  @ViewChild('studentInfo')
  studentInfo: ElementRef;
  @ViewChild('paperNotice')
  paperNotice: ElementRef;
  @ViewChild('questionLabelOne')
  questionLabelOne: ElementRef;
  @ViewChild('questionLabelTwo')
  questionLabelTwo: ElementRef;
  @ViewChild('chapter')
  chapterCountScore: ElementRef;

  private ANCHOR_RATE = 50;
  private SCROLL_OFFSET = 70;

  public isPrintPaper = false;
  isShowSave = false;
  isShowSwitch = false;
  isShowSwitchChpater = false;

  isLoading = true;
  isSubQuestion: boolean;
  isBatchDeleteQuestion = false;

  questionId: number;
  chapterType: number;
  subQuestionId: number;
  questionOriginalScore: number;
  subQuestionOriginalScore: number;
  chapterOriginalScore: number;
  index = -1;
  saveToken = '';

  question: Question;
  subQuestion: Question;
  chapter: PaperQuestionSetChapter;

  subscribe: Subscription;
  getSelectedQuestionSubscription: Subscription;
  loaderSubscription: Subscription;
  changeScoreSubscription: Subscription;
  deleteSubscription: Subscription;

  // Preview paper basic info
  allQuestionCount = 0;
  allScoreCount = 0;
  title = '';
  stageId = 0;
  courseId = 0;

  // 切换教材 结构
  stageList: Array<Stage>;
  subjectList = [];
  bookenameList = [];
  bookList: Array<Book>;
  chapters: Chapter[] = [];
  teacherId = '';
  accessToken = '';

  // 切换教材 默认值
  currentStageId = 'xiaoxue';
  currentSubjectId = 1;
  currentBookVersion = '';
  currentBookId = 297165;
  currentChapterName = '';
  currentBookName = '';
  currentType = 1;
  currentChapterId: number;

  changedScore: Score[] = [];

  isMouseEnter = false;

  initTitleElement: any;

  // 试卷类型
  types = [1, 2];
  paperTypes: PaperType[];

  tabActive = 1;  // 1 编辑 2 顺序 3 样式
  tabEditActive = true;
  tabEditStatus = 1; // 1 未选中编辑 2 试题编辑 3 标题编辑
  questionActive: number;
  preQuestionIndex = 1; // 记录上一次选中的 index 处理鼓动的特殊情况
  solutionTipActive = false;
  errorTipActive = false;

  paperQuestionSetChapters: PaperQuestionSetChapter[];
  backPaperQuestionSetChapters: PaperQuestionSetChapter[];

  chapterScore: PaperQuestionSetChapter; // 深拷贝 计算题目总分

  isHiddenSubEditId: number;  // 是否显示子分数编辑
  isShowSubEdit = false;

  // 控制试卷样式
  showStructureStyle = [false, false, false, false, false, false, false, false, false, false];
  structures: Structure[];
  clickStatus: number;  // 试卷样式选中标识 10标识都没选中

  isShowAnalysis = false; // 显示试卷分析 dialog
  isShowEditDialog = false;  // 显示编辑试题 dialog
  isShowDownload = false;
  editType = 1;
  editQuestion: Question;
  savePaperId: number;  // 保存试卷的 paperId
  editChapterTypeName: string; // 保存题材名称

  saveEdit: SaveEdit;  // 保存编辑信息
  chapterIndex: number;   // 所选编辑题型索引
  validateContent = false;  // 判断试卷样式结构的内容是否为空

  isShowChangeType = true;  // 材料题不可改变题型
  questionType: number;

  firstQuestionsIndex: number; // 第一道材料题的索引

  basketData: QuestionsBasket[];

  constructor(
    private switchBookService: SwitchBookService,
    private paperService: PaperService,
    private propertyService: PropertyService,
    private commonService: CommonService,
    private location: Location,
    private messageService: MessageService,
    private loaderService: LoaderService,
    private selectorService: SelectorService,
    private rd: Renderer2,
    private dragulaService: DragulaService,
    public utils: Utils,
  ) {
    this.commonService.renderer = rd;
  }

  ngOnInit() {
    this.loaderSubscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
      this.isLoading = state.show;
    });

    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();

    this.initTitleElement = document.getElementById('inputTitleDisplay');

    this.changeScoreCallback();

    this.deleteCallback();

    this.getSelectedQuestionContent();

    this.getPaperTypes();

    this.showStructure([0, 1, 2, 3, 4, 6, 7]);  // 默认结构

    this.initDragula();
  }

  ngAfterViewInit() {
    CKEDITOR.disableAutoInline = true;
  }

  initDragula() {
    this.dragulaService.setOptions('paperQuestionSetChapters', {
      moves: (el, source, handle, sibling) => {
        if (handle.dataset['drag'] === 'child') {
          return false;
        }
        return true;
      }
    });
    this.dragulaService.dragend.subscribe((value) => {
      this.sort();
      this.updateQuestionBasket();
    });
  }

  // 排序后更新试题篮
  private updateQuestionBasket(): void {
    const courseId = this.propertyService.readSubjectId();
    this.paperService.updateQuestionBasket(this.teacherId, courseId,
      JSON.stringify(this.paperQuestionSetChapters)).subscribe(response => {

    });
  }

  getSelectedQuestionContent() {
    this.getSelectedQuestionSubscription =
      this.paperService.getSelectedQuestionContent(this.propertyService.readTeacherId(),
        this.propertyService.readSubjectId()).subscribe(response => {
          if (response.F_responseNo === SUCCESS) {
            this.utils.setResGradeType(response.F_data[0].phase);
            this.paperQuestionSetChapters = this.backPaperQuestionSetChapters = this.commonService.dealData(response.F_data);
            this.allQuestionCount = this.commonService.getQuestionTotalCount(this.paperQuestionSetChapters);
            this.allScoreCount = this.commonService.getQuestionTotalScore(this.paperQuestionSetChapters);
            this.initProperty();
            this.init();
            // this.getChapterList();
            this.messageService.sendPaperQuestionSetChapters(this.paperQuestionSetChapters);
          }
        }, error => console.log('Get selected question fail: ' + error));
  }

  initProperty() {
    this.stageId = this.propertyService.readOldStageId();
    this.courseId = this.propertyService.readOldSubjectId();
    this.currentStageId = this.utils.mapStage(this.stageId);
    this.currentSubjectId = this.utils.mapCourseIdFromPaperToEbag(this.courseId);
    this.currentBookVersion = this.propertyService.readBookVersion();
    this.currentBookId = this.propertyService.readBookId();
    this.currentBookName = this.propertyService.readCurrentSubject();
    this.currentChapterName = this.propertyService.readChapterName();
    this.currentChapterId = this.propertyService.readChapterId();

    this.title = this.utils.getCurrentDate()
      + this.utils.mapStageIdToStageName(this.stageId)
      + this.utils.mapCourseIdToSubject(this.courseId);
  }

  // 试卷样式点击状态
  public clickStructure(clickStatus: number): void {
    this.clickStatus = clickStatus;
  }

  // 返回 按钮
  public return(): void {
    this.location.back();
  }

  // 卷标卷注
  public showPaperLabel(): void {
    this.paperQuestionSetChapters = _.sortBy(this.paperQuestionSetChapters, (chapter) => {
      return chapter.type;
    });
    let count = 1;
    let isFirst = true;
    this.paperQuestionSetChapters.forEach((c, cIndex) => {
      c.questionsContent.forEach(q => {
        q.number = count++;
      });
    });
    let showChoice = false;
    let showMaterial = false;
    this.paperQuestionSetChapters.forEach((c, cIndex) => {
      if (c.type <= 10003) {
        showChoice = true;
      }
      if (c.type >= 10004 && isFirst) {
        this.firstQuestionsIndex = cIndex;
        isFirst = false;
        showMaterial = true;
      }
    });
    this.showStructureStyle[8] = showChoice;
    this.showStructureStyle[9] = showMaterial;
  }

  // 切换工具栏
  public switchTag(target: number, questionId?: number, tabEditStatus?: number, question?: Question, chapterName?: string): void {
    if (target === 1 || target === 4) {
      if (tabEditStatus === 2) {
        this.tabEditStatus = 2;
      }
      this.tabEditActive = true;
    } else {
      this.tabEditActive = false;
    }
    this.tabActive = target;
    if (target === 1 && this.questionActive && this.questionActive !== questionId) {
      this.solutionTipActive = false;
      this.errorTipActive = false;
    }
    if (questionId) {
      this.questionActive = questionId;
      this.editQuestion = question;
      this.editChapterTypeName = chapterName;
    }
    if (question && question.type) {
      this.questionType = question.type;
    }
    if (this.questionType && this.questionType >= 10010) {
      this.isShowChangeType = false;
    } else {
      this.isShowChangeType = true;
    }
  }

  public editTitle(target: number, chapterScore: PaperQuestionSetChapter, chapterIndex: number): void {
    this.tabActive = target;
    this.tabEditStatus = 3;
    this.tabEditActive = true;
    this.chapterScore = _.cloneDeep(chapterScore);
    this.chapterIndex = chapterIndex;
    let countScore = 0;
    this.chapterScore.questionsContent.forEach((questionScore, index) => {
      countScore += (+questionScore.score);
    });
    this.chapterScore.presetScore = countScore;
  }

  // 二级题目
  public questionBlur(questionIndex: number, questionScore: number): void {
    let countScore = 0;
    this.chapterScore.questionsContent[questionIndex].score = +questionScore;
    this.chapterScore.questionsContent.forEach(question => {
      countScore += (+question.score);
    });
    this.chapterScore.presetScore = countScore;
  }

  // 三级题目
  questionsBlur(questionIndex: number, questionsIndex: number, questionsScore: string): void {
    let questionScore = 0;
    const questionsItem = this.chapterScore.questionsContent[questionIndex];
    const questionsItems = questionsItem.questions;
    questionsItems[questionsIndex].score = +questionsScore;
    questionsItems.forEach(question => {
      questionScore += (+question.score);
    });
    questionsItem.score = questionScore;
    this.questionBlur(questionIndex, questionsItem.score);
  }

  showStructure(showStructure: Array<number>): void {
    if (!showStructure.length) {
      return;
    }
    const a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const b = new Set(showStructure);
    const difference = Array.from(new Set([...a].filter(x => !b.has(x))));  // 差集
    const intersection = Array.from(new Set([...a].filter(x => b.has(x)))); // 交集
    intersection.forEach(v => {
      this.showStructureStyle[v] = true;
    });
    difference.forEach(v => {
      this.showStructureStyle[v] = false;
    });
    if (this.showStructureStyle[9]) {
      this.showPaperLabel();
    }
  }

  public clickStopPropagation(ev: Event): void {
    ev.stopPropagation();
  }

  public showSubEdit(ev: Event, subQuestionId: number): void {
    ev.stopPropagation();
    if (this.isHiddenSubEditId && (subQuestionId === this.isHiddenSubEditId)) {
      this.isShowSubEdit = !this.isShowSubEdit;
    } else if (this.isHiddenSubEditId && (subQuestionId !== this.isHiddenSubEditId)) {
      this.isShowSubEdit = true;
    } else {
      this.isShowSubEdit = true;
    }
    this.isHiddenSubEditId = subQuestionId;
  }

  // 平均分数
  equalDivision(chapterScore: string): void {
    let countScore = +chapterScore;
    // 材料题平均分数
    if (this.chapterScore.type >= 10010) {
      this.equalQuestionsDivision(+chapterScore);
      return;
    }
    // 非材料题平均分数
    const questionCount = this.chapterScore.questionCount;
    const ave = Math.floor(+((+chapterScore) / questionCount));
    if (countScore < questionCount) {
      this.messageService.sendMessageDialog('所设分数不能小于题目数量');
      this.chapterScore.presetScore = questionCount;
      return;
    }
    this.chapterScore.questionsContent.forEach(q => {
      q.score = ave;
      countScore -= ave;
    });
    this.chapterScore.questionsContent.forEach(q => {
      if (countScore > 0) {
        q.score ++;
        countScore--;
      }
    });
  }

  // 计算材料题平均分
  private equalQuestionsDivision(countScore: number): void {
    let questionsCount = 0;  // 小题总数
    let count = countScore;
    this.chapterScore.questionsContent.forEach(q => {
      questionsCount += q.questions.length;
    });
    if (count < questionsCount) {
      this.messageService.sendMessageDialog('所设分数不能小于题目数量');
      this.chapterScore.presetScore = questionsCount;
      return;
    }
    const ave = Math.floor(count / questionsCount);
    this.chapterScore.questionsContent.forEach(q => {
      q.questions.forEach(qs => {
        qs.score = ave;
        count -= ave;
      });
    });
    this.chapterScore.questionsContent.forEach(q => {
      q.questions.forEach(qs => {
        if (count > 0) {
          qs.score ++;
          count--;
        }
      });
    });
    this.chapterScore.questionsContent.forEach(q => {
      let i = 0;
      q.questions.forEach(qs => {
        i += qs.score;
        return i;
      });
      q.score = i;
    });
  }

  isCloseAnalysis(isClose: boolean): void {
    this.isShowAnalysis = isClose;
  }

  isCloseDownloadDialog(isClose: boolean): void {
    this.isShowDownload = isClose;
    this.isPrintPaper = isClose;
  }

  isCloseEditDialog(isClose: boolean): void {
    this.isShowEditDialog  = isClose;
  }

  // editType 1 编辑试题 2 改变题型 3 插入试题
  showEditDialog(editType: number): void {
    this.isShowEditDialog = true;
    this.editType = editType;
  }

  public isShowSolutionArea(showSolution: boolean): void {
    this.isPrintPaper = showSolution;
  }

  /**
   * 修改材料题带有小题目的分数
   * @param question
   * @param subQuestion
   * @param chapterType
   * @param index
   * @param subIndex
   */
  changeSubQuestion(question: Question, subQuestion: Question, chapter: PaperQuestionSetChapter, index: number, subIndex: number) {
    this.chapter = chapter;
    this.questionOriginalScore = question.score;
    this.subQuestionOriginalScore = subQuestion.score;
    this.question = question;
    this.subQuestion = subQuestion;
    this.isSubQuestion = true;

    const score: ChangeScore = new ChangeScore();
    score.question = subQuestion;
    score.index = index;
    score.subIndex = subIndex;
    score.isBatchChange = false;
    this.messageService.sendChangeScoreMessage(score);
  }

  /**
   * @param type 1 表示鼠标进入题型区域 2 表示鼠标进入题目区域 3 表示鼠标进入子题目区域
   */
  mouseEnter(type: number, id: number): void {
    switch (type) {
      case 1: this.chapterType = id; break;
      case 2: this.questionId = id; break;
      case 3: this.subQuestionId = id; break;
      case 4: this.isMouseEnter = true; break;
      default: break;
    }
  }

  mouseLeave(): void {
    this.chapterType = 0;
    this.questionId = 0;
    this.subQuestionId = 0;

    this.isMouseEnter = false;
  }

  isHideChapter(type: number): boolean {
    if (type === this.chapterType) {
      return false;
    } else {
      return true;
    }
  }

  isHideSubQuestionTip(id: number) {
    if (id === this.subQuestionId) {
      return false;
    } else {
      return true;
    }
  }

  // 保存编辑后重新获取试题数据
  refreshQuestion(ev: Event) {
    if (ev) {
      this.getSelectedQuestionContent();
    }
    this.tabEditStatus = 1;
  }

  handleQuestionHidden(questionId) {
    if (questionId === this.questionId) {
      return false;
    } else {
      return true;
    }
  }

  changeScoreCallback() {
    this.changeScoreSubscription = this.messageService.getChangeScoreDialogObservable().subscribe(mark => {
      this.propertyService.writeChangedScore('');

      if (mark === 1) {
        if (this.isSubQuestion) {
          if (this.subQuestion.score !== this.subQuestionOriginalScore) {
            this.unique(this.getChangedScore(this.subQuestion));
          }
          this.question.score = this.questionOriginalScore - this.subQuestionOriginalScore + +this.subQuestion.score;
          this.chapter.presetScore += this.question.score - this.questionOriginalScore;
          this.allScoreCount += this.question.score - this.questionOriginalScore;
          document.getElementById(String(this.subQuestion.id)).textContent = '（' + this.subQuestion.score + '分）';
          document.getElementById(String(this.question.id)).textContent = '（' + this.question.score + '分）';
        } else {
          if (this.question.score !== this.questionOriginalScore) {
            this.unique(this.getChangedScore(this.question));
          }
          this.chapter.presetScore += this.question.score - this.questionOriginalScore;
          this.allScoreCount += this.question.score - this.questionOriginalScore;
          document.getElementById(String(this.question.id)).textContent = '（' + this.question.score + '分）';
        }
      } else if (mark === 2) {
        // 批量修改分数逻辑
        this.allScoreCount += this.chapter.presetScore - this.chapterOriginalScore;
        if (this.chapter.type >= CLOZE && this.chapter.type <= SEVEN_SELECT_FIVE) {
          // 对完型填空和七选五做特殊处理
          document.getElementById(String(this.chapter.questionsContent[0].id)).textContent = '（'
            + this.chapter.questionsContent[0].score + '分）';
          this.chapter.questionsContent[0].questions.forEach((question, index) => {
            document.getElementById(String(question.id)).textContent = '（' + question.score + '分）';
            this.unique(this.getChangedScore(this.question));
          });
        } else {
          this.chapter.questionsContent.forEach((item, index) => {
            document.getElementById(String(item.id)).textContent = '（' + item.score + '分）';
            this.unique(this.getChangedScore(item));
          });
        }
      }
      this.setScore(JSON.stringify(this.changedScore));
      this.propertyService.writeChangedScore(JSON.stringify(this.changedScore));
    }, error => console.log('Change score fail: ' + error));
  }

  deleteCallback() {
    this.deleteSubscription = this.messageService.getDialogSureObservable().subscribe(mark => {
      let questionContent: Question[][] = [];
      let isSendDeleteRequest = false;

      if (mark === PREVIEW_PAPER_DELETE_QUESTION) {
        if (this.index < 0) {
          return;
        }
        const chapter = this.backPaperQuestionSetChapters[this.index];

        if (chapter['questionCount'] === 1 || this.isBatchDeleteQuestion) {
          if (this.isBatchDeleteQuestion) {
            this.allQuestionCount -= chapter.questionCount;
            this.allScoreCount -= chapter.presetScore;
          } else {
            chapter.questionCount--;
            chapter.presetScore -= this.question.score;
            this.allQuestionCount--;
            this.allScoreCount -= this.question.score;
          }
          questionContent = this.backData(questionContent);
          questionContent.splice(this.index, 1);
          this.backPaperQuestionSetChapters.splice(this.index, 1);
          isSendDeleteRequest = true;
        } else {
          chapter.questionsContent.some((question, index) => {
            if (question.id === this.question.id) {
              const questionsId = chapter.questions.split(',');
              questionsId.some((questionId, questionIdindex) => {
                if (+questionId === this.question.id) {
                  chapter.questionsContent.splice(index, 1);
                  chapter.questionCount--;
                  chapter.presetScore -= this.question.score;
                  this.allQuestionCount--;
                  this.allScoreCount -= this.question.score;
                  questionsId.splice(questionIdindex, 1);
                  let ids = '';
                  questionsId.forEach((id, idIndex) => {
                    ids += id + ',';
                  });
                  chapter.questions = ids.substring(0, ids.length - 1);

                  questionContent = this.backData(questionContent);

                  isSendDeleteRequest = true;
                  return true;
                } else {
                  isSendDeleteRequest = false;
                  return false;
                }
              });
              return true;
            } else {
              isSendDeleteRequest = false;
              return false;
            }
          });
        }

        if (isSendDeleteRequest) {
          const courseId = this.propertyService.readSubjectId();
          this.paperService.updateQuestionBasket(this.teacherId, courseId,
            JSON.stringify(this.backPaperQuestionSetChapters)).subscribe(response => {
              if (response.F_responseNo === SUCCESS) {
                this.backPaperQuestionSetChapters.forEach((recoverChapter, recoverIndex) => {
                  recoverChapter.questionsContent = questionContent[recoverIndex];
                });
                this.sort();
                this.paperQuestionSetChapters = this.backPaperQuestionSetChapters;
              }
            }, error => console.log('Preview Error: ' + error));
        }
      }
    }, error => console.log('Delete fail: ' + error));
  }

  deleteQuestion(chapterIndex: number, question: Question) {
    if (this.paperQuestionSetChapters.length === 1) {
      if (this.paperQuestionSetChapters[0].questionsContent.length === 1) {
        this.messageService.sendMessageDialog('至少保留一个小题');
        return;
      }
    }
    this.index = chapterIndex;
    this.question = question;
    this.isBatchDeleteQuestion = false;
    this.messageService.sendDialogMessage(PREVIEW_PAPER_DELETE_QUESTION);
  }

  deleteQuestions(chapterIndex: number) {
    if (this.paperQuestionSetChapters.length === 1) {
      if (this.paperQuestionSetChapters.length === 1) {
        this.messageService.sendMessageDialog('至少保留一个小题');
        return;
      }
    }
    this.index = chapterIndex;
    this.isBatchDeleteQuestion = true;
    this.messageService.sendDialogMessage(PREVIEW_PAPER_DELETE_QUESTION);
  }

  backData(questionContent: Question[][]) {
    this.backPaperQuestionSetChapters.forEach((backChapter, backChapterIndex) => {
      questionContent[backChapterIndex] = backChapter.questionsContent;
      backChapter.questionsContent = [];
    });
    return questionContent;
  }

  sort() {
    let count = 1;
    this.backPaperQuestionSetChapters.forEach((item, index) => {
      item.questionsContent.forEach((question, questionIndex) => {
        question.number = count++;
      });
    });
  }

  private addWarnBorder(el: Element): void {
    this.rd.addClass(el, 'warn-border');
    setTimeout(() => {
      this.rd.removeClass(el, 'warn-border');
    }, 2000);
  }

  // 验证并保存分数
  private validateQuestionScore(chapterScore): void {
    let flag = false;
    chapterScore.questionsContent.forEach(question => {
      if (!question.questions) {
        if (question.score === 0) {
          const el = document.getElementById(`questionScore${question.id}`);
          this.addWarnBorder(el);
          return;
        }
        const questionScore = {
          questionId: question.id,
          nScore: question.score
        };
        this.saveEdit.setscore.push(questionScore);
      } else {
        question.questions.forEach(smallQ => {
          if (smallQ.score === 0) {
            flag = true;
            this.addWarnBorder(document.getElementById(`questionScore${question.id}`));
            return;
          }
          const smallQScore = {
            questionId: smallQ.id,
            nScore: smallQ.score
          };
          this.saveEdit.setscore.push(smallQScore);
        });
      }
    });
    if (flag) {
      return;
    }
  }

  private getChapterScoreCount(chapterScore: PaperQuestionSetChapter): number {
    let count = 0;
    chapterScore.questionsContent.forEach(q => {
      count += q.score;
      if (!_.isEmpty(q.questions)) {
        q.questions.forEach(qs => {
          count += qs.score;
        });
      }
    });
    return count;
  }

  /**
   * 保存大题题型修改
   */
  saveEditQuestion(chapterScore: PaperQuestionSetChapter): void {
    if ((+this.chapterCountScore.nativeElement.value) !== this.getChapterScoreCount(chapterScore)) {
      this.equalDivision(this.chapterCountScore.nativeElement.value);
      chapterScore.presetScore = +this.chapterCountScore.nativeElement.value;
    }
    const detailEl = this.editChapterDetail.nativeElement;
    this.saveEdit = new SaveEdit;
    this.saveEdit.setscore = [];
    this.saveEdit.name = this.editChapterName.nativeElement.value;
    this.saveEdit.detail = detailEl.value;
    if (!this.saveEdit.detail) {
      this.addWarnBorder(detailEl);
      return;
    }
    this.validateQuestionScore(chapterScore);
    this.saveEdit.type = chapterScore.type;
    this.saveEdit.courseId = chapterScore.courseId;
    this.switchBookService.setEditQuestion(this.teacherId, this.accessToken, JSON.stringify(this.saveEdit)).subscribe(response => {
      if (response.F_responseNo === 10000) {
        this.messageService.sendPromptMessage('保存修改成功');
        const chapter = this.paperQuestionSetChapters[this.chapterIndex];
        chapter.name = this.saveEdit.name;
        chapter.detail = this.saveEdit.detail;
        let index = 0;
        // 重置分数
        let presetScore = 0;
        chapter.questionsContent.forEach((question, questionIndex) => {
          if (!question.questions) {
            question.score = this.saveEdit.setscore[questionIndex].nScore;
            presetScore += question.score;
          } else {
            question.score = 0;
            question.questions.forEach(smallQ => {
              smallQ.score = this.saveEdit.setscore[index].nScore;
              question.score += smallQ.score;
              presetScore += smallQ.score;
              index++;
            });
          }
        });
        chapter.presetScore = presetScore;
      }
    });
  }

  // 保存试卷 按钮
  savePaper() {
    // 判断是否有空的结构样式内容
    if (this.validateContent) {
      this.messageService.sendMessageDialog('试卷结构样式内容不能为空');
      return;
    }
    // 对题目进行重新排序
    this.paperQuestionSetChapters.forEach((items, i) => {
        const questionContent = items.questionsContent;
        let questions = '';
        questionContent.forEach((item, j) => {
            if (j === 0) {
              questions += item.id;
            } else {
              questions += ',' + item.id;
            }
        });
        items.questions = questions;
    });
    if (this.paperQuestionSetChapters.length > 0) {
      this.getSaveToken();
      if (this.mainTitle) {
        this.title = this.mainTitle.nativeElement.innerText;
      } else {
        this.title = this.title = this.utils.getCurrentDate()
        + this.utils.mapStageIdToStageName(this.stageId)
        + this.utils.mapCourseIdToSubject(this.courseId);
      }
    } else {
      this.messageService.sendDialogMessage(SAVE_PAPER);
    }

  }

  // 选择题型
  selectType(typeId: number): void {
    this.currentType = typeId;
  }

  // switch chapter

  // 学段
  handleStage(stageId: string): void {
    // 自动选择第一个
    this.stageId = this.utils.mapStageNameToStageId(stageId);
    this.currentStageId = stageId;

    this.switchBookService.getSubjectList(this.accessToken, this.teacherId, this.currentStageId)
      .pipe(mergeMap((subjectResponse: SubjectResponse) => {
        if (subjectResponse.F_responseNo === SUCCESS) {
          this.subjectList = subjectResponse.F_list;
          if (this.subjectList.length > 0) {
            this.currentSubjectId = this.subjectList[0];
          }
        }
        return this.switchBookService.getBookenameList(this.accessToken, this.teacherId, this.currentStageId, this.currentSubjectId)
          .pipe(mergeMap((bookVersion: BookenameResponse) => {
            if (bookVersion.F_responseNo === SUCCESS) {
              this.bookenameList = bookVersion.F_list;
              if (this.bookenameList.length > 0) {
                this.currentBookVersion = this.bookenameList[0];
              }
            }
            return this.switchBookService.getBookList(this.accessToken, this.teacherId, this.currentStageId,
              this.currentSubjectId, this.currentBookVersion);
          }));
      }))
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          this.bookList = response.F_list;
          if (this.bookList.length && this.bookList.length > 0) {
            this.currentBookId = this.bookList[0].F_book_id;
            this.currentBookName = this.bookList[0].F_book_name;
          }
        }
      });
  }

  // 科目
  handleSubject(subjectId: number): void {
    // 展示 bookename 数据
    this.currentSubjectId = subjectId;

    this.switchBookService.getBookenameList(this.accessToken, this.teacherId, this.currentStageId, this.currentSubjectId)
      .pipe(mergeMap((bookVersion: BookenameResponse) => {
        if (bookVersion.F_responseNo === SUCCESS) {
          this.bookenameList = bookVersion.F_list;
          if (this.bookenameList.length > 0) {
            this.currentBookVersion = this.bookenameList[0];
          }
        }
        return this.switchBookService.getBookList(this.accessToken, this.teacherId, this.currentStageId,
          this.currentSubjectId, this.currentBookVersion);
      }))
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          this.bookList = response.F_list;
          if (this.bookList.length > 0) {
            this.currentBookId = this.bookList[0].F_book_id;
            this.currentBookName = this.bookList[0].F_book_name;
          }
        }
      });
  }

  // 版本
  handleBookename(bookVersion: string): void {
    this.currentBookVersion = bookVersion;

    this.switchBookService.getBookList(this.accessToken, this.teacherId, this.currentStageId,
      this.currentSubjectId, this.currentBookVersion)
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          this.bookList = response.F_list;
          if (this.bookList.length > 0) {
            this.currentBookId = this.bookList[0].F_book_id;
            this.currentBookName = this.bookList[0].F_book_name;
          }
        }
      });
  }

  // 教材
  handleBook(bookId: number, bookName: string): void {
    this.currentBookId = bookId;
    this.currentBookName = bookName;
  }

  // 获取教材名称
  handleChapterName(name: string, chapterId: number): void {
    this.currentChapterName = name;
    this.currentChapterId = chapterId;
  }

  // 获取章节
  getChapterList() {
    this.switchBookService.getChapterList(this.propertyService.readAccesstoken(), this.propertyService.readTeacherId(), this.currentBookId)
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          this.chapters = response.F_list;
          this.currentChapterName = this.chapters[0].F_chapter_name;
        }
      });
  }

  // 获取试卷类型
  getPaperTypes() {
    this.selectorService.getTypes(1, this.propertyService.readStageId()).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        this.paperTypes = response.F_paper_types;
      }
    });
  }

  getSaveToken() {
    this.switchBookService.getSaveToken(this.teacherId, this.accessToken).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        this.saveToken = response.F_token;
        this.isShowSave = true;
      } else {
        this.messageService.sendPromptMessage('账号未登录或者已经在其它地方登录');
        this.isShowSave = false;
      }
    }, error => this.isShowSave = false);
  }

  init() {
    this.switchBookService.getStageList(this.teacherId, this.accessToken).pipe(mergeMap((stageResponse: StageResponse) => {
      if (stageResponse.F_responseNo === SUCCESS) {
        this.stageList = stageResponse.F_list;
      }
      return this.switchBookService.getSubjectList(this.accessToken, this.teacherId, this.currentStageId)
        .pipe(mergeMap((subjectResponse: SubjectResponse) => {
          if (subjectResponse.F_responseNo === SUCCESS) {
            this.subjectList = subjectResponse.F_list;
          }
          return this.switchBookService.getBookenameList(this.accessToken, this.teacherId, this.currentStageId, this.currentSubjectId)
            .pipe(mergeMap((bookVersion: BookenameResponse) => {
              if (bookVersion.F_responseNo === SUCCESS) {
                this.bookenameList = bookVersion.F_list;
              }
              return this.switchBookService.getBookList(this.accessToken, this.teacherId, this.currentStageId,
                this.currentSubjectId, this.currentBookVersion)
                .pipe(mergeMap((bookResponse: BookResponse) => {
                  if (bookResponse.F_responseNo === SUCCESS) {
                    this.bookList = bookResponse.F_list;
                  }

                  return this.switchBookService.getChapterList(this.accessToken, this.teacherId, this.currentBookId);
                }));
            }));
        }));
    }))
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          this.chapters = response.F_list;
        }
      });
  }

  complete() {
    this.getChapterList();
    this.isShowSwitch = false;
  }

  getChangedScore(question: Question): Score {
    const score: Score = new Score;
    score.questionId = question.id;
    score.nScore = +question.score;
    return score;
  }

  unique(score: Score) {
    this.changedScore.some((item, index) => {
      if (item.questionId === score.questionId) {
        this.changedScore.splice(index, 1);
        return true;
      }
    });
    this.changedScore = this.changedScore.concat(score);
  }

  public validateStructure(ev: Event): void {
    this.clickStatus = 10;
    if (_.trim(ev.target['innerText']) === '') {
      this.messageService.sendMessageDialog('内容不能为空');
      this.validateContent = true;
    } else {
      this.validateContent = false;
    }
  }

  /**
   * 修改分数
   *
   * @param jsonData
   */
  setScore(jsonData: string): boolean {
    console.log('modify score', jsonData);
    let isSuccess = false;

    this.switchBookService.setScore(this.propertyService.readTeacherId(), this.propertyService.readAccesstoken(), jsonData)
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          isSuccess = true;
        } else {
          isSuccess = false;
        }
      }, error => {
        isSuccess = false;
        console.log('Set score fail: ' + error);
      });

    return isSuccess;
  }

  saveStructures(structures: Structure[]): Structure[] {
    const structure = {
      id: 0,
      isChose: false,
      detail: '',
    };
    structures = [];
    for (let i = 0; i < 10; i ++) {
      structures.push(_.cloneDeep(structure));
    }
    for (let j = 0, len = this.showStructureStyle.length; j < len; j++) {
      structures[j].id = j;
      structures[j].isChose = this.showStructureStyle[j];
    }
    structures[0].detail = this.mainTitle ? this.mainTitle.nativeElement.innerText : this.title;
    structures[1].detail = this.subTitle ? this.subTitle.nativeElement.innerText : '';
    structures[2].detail = '';
    structures[3].detail = this.paperMarking ? this.paperMarking.nativeElement.innerText : '';
    structures[4].detail = this.paperInfo ? this.paperInfo.nativeElement.innerText : '';
    structures[5].detail = this.studentInfo ? this.studentInfo.nativeElement.innerText : '';
    structures[6].detail = '';
    structures[7].detail = this.paperNotice ? this.paperNotice.nativeElement.innerText : '';
    structures[8].detail = this.questionLabelOne ? this.questionLabelOne.nativeElement.innerText : '';
    structures[9].detail = this.questionLabelTwo ? this.questionLabelTwo.nativeElement.innerText : '';
    return structures;
  }

  // 保存试卷
  save(commentValue: string) {
    this.errorTipActive = false;
    if (!this.title) {
      this.messageService.sendMessageDialog('试卷名称不能为空');
      return;
    }
    const bean: SavePaper = new SavePaper();

    const paper: Paper = new Paper();
    paper.name = this.title;
    paper.comment = commentValue;
    paper.type = this.currentType;
    paper.fullScore = this.allScoreCount;
    paper.gradeId = this.propertyService.readGradeId();
    paper.courseId = this.courseId;
    paper.chapterId = +this.currentChapterId;
    paper.bookId = +this.currentBookId;

    paper.structures = this.saveStructures(paper.structures);

    const paperQuestionSetChapters: PaperQuestionSetChapter[] = [];
    let questionIds = '';

    this.paperQuestionSetChapters.forEach((item, index) => {
      questionIds += item.questions + ',';
      const paperQuestionSetChapter: PaperQuestionSetChapter = new PaperQuestionSetChapter();
      paperQuestionSetChapter.name = item.name;
      paperQuestionSetChapter.desc = '共 ' + item.questionCount + ' 题，' + '共 ' + item.presetScore + ' 分';
      paperQuestionSetChapter.questionCount = item.questionCount;
      paperQuestionSetChapter.presetScore = item.presetScore;
      paperQuestionSetChapters.push(paperQuestionSetChapter);
    });

    const questionSet: QuestionSet = new QuestionSet;
    questionSet.questionIds = '[' + questionIds.substring(0, questionIds.length - 1) + ']';
    questionSet.paperQuestionSetChapters = paperQuestionSetChapters;

    paper.questionSet = questionSet;

    bean.F_data = paper;
    bean.F_score_data = this.changedScore;

    this.requestNetwork(bean);
  }

  cancel() {
    this.isShowSave = !this.isShowSave;
    this.initProperty();
  }

  requestNetwork(bean: SavePaper) {
    this.switchBookService.savePaper(this.teacherId, this.accessToken, this.saveToken,
      JSON.stringify(bean))
      .pipe(mergeMap((savePaperResponse: SavePaperResponse) => {
        if (savePaperResponse.F_responseNo === SUCCESS) {
          this.savePaperId = savePaperResponse.F_paper_id;
          return this.paperService.quote(this.propertyService.readTeacherId(), this.propertyService.readAccesstoken(),
            this.propertyService.readPeriodId(), this.propertyService.readMoment(), '[' + String(savePaperResponse.F_paper_id) + ']');
        }
      }))
      .subscribe(response => {
        if (response.F_responseNo === SUCCESS) {
          this.isShowSave = false;
          this.propertyService.writeChangedScore('');
          this.messageService.sendPromptMessage('组卷保存并引用成功');
          this.propertyService.writeTitle('');
          // setTimeout(function () {
          //   window.close();
          // }, 1000);
          this.isShowSave = false;
          this.isShowDownload = true;
        } else {
          this.getSaveToken();
        }
      }, error => {
        this.getSaveToken();
        console.log('Save paper fail: ' + error);
      });
  }
  // unsubscribe
  ngOnDestroy(): void {
    if (this.subscribe !== undefined) {
      this.subscribe.unsubscribe();
    }

    if (this.getSelectedQuestionSubscription !== undefined) {
      this.getSelectedQuestionSubscription.unsubscribe();
    }

    if (this.loaderSubscription !== undefined) {
      this.loaderSubscription.unsubscribe();
    }

    if (this.changeScoreSubscription !== undefined) {
      this.changeScoreSubscription.unsubscribe();
    }

    this.dragulaService.destroy('paperQuestionSetChapters');
  }

  // 大题题目定位
  public chapterAnchor(event: Event, targetId: string): void {
    const documentElement = document.documentElement;
    const targetDom = document.getElementById(targetId);
    this.commonService.handleAnchor(targetDom, documentElement, this.SCROLL_OFFSET, this.ANCHOR_RATE);
  }

  // 小题题目定位
  public handleAnchor(event: Event, targetId: string, index: number, question?: Question, chapterName?: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.solutionTipActive = false;
    this.errorTipActive = false;
    this.switchTag(2, +targetId, 2, question, chapterName);
    let specialCase = false;
    if (index > this.preQuestionIndex) {
      specialCase = true;
    } else {
      specialCase = false;
    }
    this.preQuestionIndex = index;
    let documentElement: Element;
    documentElement = document.documentElement;
    const targetDom = document.getElementById(targetId).parentElement.parentElement.parentElement;
    this.commonService.handleAnchor(targetDom, documentElement, this.SCROLL_OFFSET, this.ANCHOR_RATE, specialCase);
  }
}
