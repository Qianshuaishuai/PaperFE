import { PaperService } from '../../../service/paper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { F_data, Info, PaperQuestionSetChapter, Question } from './data/paperDetailsResponse';
import {
  Component, OnInit, OnDestroy, ViewEncapsulation, ElementRef, Renderer2, ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import { SUCCESS, REMOVE_ALL_FROM_QUESTION_BASKET, PRIMARY_SCHOOL } from '../../../constants';
import { LoaderService } from '../../../service/loader.service';
import { LoaderState } from '../../../bean/loader-state';
import { QuestionBasket } from '../../../bean/question-basket';
import { PropertyService } from '../../../service/property.service';
import { QuestionsBasket } from '../../../response/question-basket-response';
import { Utils } from '../../../utils';
import { CommonService } from '../../../service/common.service';
import { SolveDialog } from '../../../bean/solve-dialog';
import { CorrectionDialog } from '../../../bean/correction-dialog';
import { MessageService } from '../../../service/message.service';

@Component({
  selector: 'app-paper-details',
  templateUrl: './paper-details.component.html',
  styleUrls: ['./paper-details.component.scss'],
  encapsulation: ViewEncapsulation.None, // 渲染刷新更新css
})

export class PaperDetailsComponent implements OnInit, OnDestroy {

  // @Output() sendQuestionIds = new EventEmitter<number[]>();
  questionIds = [];

  shrink: string;
  questionId: number;
  paperId: number;

  @ViewChild('origin')
  originElementRef: ElementRef;

  @ViewChild('copy')
  copyElementRef: ElementRef;

  @ViewChild('contain')
  containElementRef: ElementRef;

  @ViewChild('scroll')
  scrollElementRef: ElementRef;

  @ViewChild('mainClassHeight')
  mainClassHeightElementRef: ElementRef;

  private ANCHOR_RATE = 10;
  private SCROLL_OFFSET = 14;
  DEFAULT_DEBOUNCE_TIME = 500;

  // 试卷信息相关数据(单独抽出来的字段信息都需特殊处理)
  paperInfo: Info;
  paperData: F_data;
  paperDate: string;
  paperType: string;
  paperDifficulty: string;
  paperQuestionSetChapters: PaperQuestionSetChapter[];
  fullScore: number;
  title: string;
  typeName: string;
  question: Question;
  temp: Question;

  // 试卷题目数组
  isShowSolution: Boolean;

  subscribe: Subscription;
  loaderSubscription: Subscription;
  updateStatusSubscription: Subscription;
  removeAllFromQuestionBasketSubscription: Subscription;
  basketIdsSub: Subscription;

  // 题目定位
  solutionTipActive = false;
  errorTipActive = false;
  questionActive = 0;

  isLoading = true;

  isJoinAll = false;

  isFromEbagEnter = false;
  isShowDifficulty = true;

  joinedQuestionBasketCount = 0;
  totalCount = 0;

  time = '';

  type = 1;

  // 1 表示从备课本进入 2 表示从试卷库进入
  mark: number;

  // 3 表示同步试卷
  isSyncPaper: number;
  classMainHeight: number;

  isShow = true;

  public isShowDownloadPaper = false;

  public isPrintPaper = false;

  constructor(
    private route: ActivatedRoute,
    private paperService: PaperService,
    private loaderService: LoaderService,
    private messageService: MessageService,
    private propertyService: PropertyService,
    private commonService: CommonService,
    private renderer: Renderer2,
    private router: Router,
    public utils: Utils,
  ) {
    this.commonService.renderer = renderer;
  }

  /*
  *  初始化试卷数据，通过双向绑定生成对应试卷列表
  */
  ngOnInit() {
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';

    this.classMainHeight = document.body.clientHeight;

    this.renderer.setStyle(this.mainClassHeightElementRef.nativeElement, 'min-height', this.classMainHeight + 'px');

    this.initPaperInfo();

    this.loaderSubscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
      this.isLoading = state.show;
    });

    this.removeAllFromQuestionBasketSubscription = this.messageService.getDialogSureObservable().subscribe(mark => {
      if (mark === REMOVE_ALL_FROM_QUESTION_BASKET) {
        this.messageService.sendRemoveAllQuestionsMessage();
      }
    });

    this.updateStatus();
  }

  // 题目定位
  // handleAnchor(event: Event, targetId: string, index: number): void {
  //   event.stopPropagation();
  //   event.preventDefault();
  //   this.solutionTipActive = false;
  //   this.errorTipActive = false;
  //   this.switchTag(2, +targetId);
  //   let specialCase = false;
  //   if (index > this.preQuestionIndex) {
  //     specialCase = true;
  //   } else {
  //     specialCase = false;
  //   }
  //   this.preQuestionIndex = index;
  //   let documentElement: Element;
  //   documentElement = document.documentElement;
  //   const targetDom = document.getElementById(targetId).parentElement.parentElement.parentElement;
  //   this.commonService.handleAnchor(targetDom, documentElement, this.SCROLL_OFFSET, this.ANCHOR_RATE, specialCase);
  // }

  // 题目定位
  handleAnchor(targetId): void {
    const targetDom = document.getElementById(targetId);
    let documentElement: Element;
    documentElement = document.documentElement;
    this.commonService.handleAnchor(targetDom, documentElement, this.SCROLL_OFFSET, this.ANCHOR_RATE);
  }

  public selectQuestion(questionId: number): void {
    if (questionId !== this.questionActive) {
      this.solutionTipActive = true;
    } else {
      this.solutionTipActive = !this.solutionTipActive;
    }
    this.questionActive = questionId;
    if (this.solutionTipActive) {
      setTimeout(() => {
        this.handleAnchor(questionId);
      }, 10);
    }
  }

  public selectError(questionId: number): void {
    if (questionId !== this.questionActive) {
      this.errorTipActive = true;
    } else {
      this.errorTipActive = !this.errorTipActive;
    }
    this.questionActive = questionId;
  }

  return(): void {
    if (this.mark === 1) {
      window.close();
    } else {
      // this.location.back();
      if (this.type === 2 && this.isSyncPaper !== 3) {
        this.propertyService.writeCurrentNavigationStatus(2);
        // this.router.navigate(['/library', this.propertyService.readSubjectId(), this.propertyService.readGradeId(), -1, 0]);
        this.router.navigate(['/library', this.propertyService.readSubjectId(), this.propertyService.readGradeId(),
          this.propertyService.readPaperTypeId(), 1]);
        this.messageService.setIsReturnFromDetail(true);
      } else if (this.type === 1 && this.isSyncPaper !== 3) {
        this.router.navigate(['/library', this.propertyService.readSubjectId(), this.propertyService.readGradeId(),
          this.propertyService.readProvinceId(), this.propertyService.readPaperTypeId(), 1]);
        this.messageService.setIsReturnFromDetail(true);
      } else if (this.isSyncPaper === 3) {
        this.propertyService.writeCurrentNavigationStatus(3);
        this.router.navigate(['/library', this.propertyService.readSubjectId(), this.propertyService.readGradeId(),
          this.propertyService.readProvinceId(), this.propertyService.readPaperTypeId(), 1]);
        this.messageService.setIsReturnFromDetail(true);
      }
    }
  }

  joinBasketAnimation(): void {
    const origin = document.getElementById(`${this.questionId}`).parentElement.parentElement.parentElement;
    const scroll = this.scrollElementRef.nativeElement.scrollTop;
    const containHeight = (this.containElementRef.nativeElement.offsetHeight) / 2;  // 屏幕可视区域的高度的一半
    const containWidth = this.containElementRef.nativeElement.offsetWidth;  // 屏幕可视区域的宽度
    const documentScrollTop = document.documentElement.scrollTop;  // 屏幕滚动高度

    const originHeight = origin.parentElement.offsetHeight;

    const originLeft = this.commonService.getElementLeft(origin);
    const originTop = this.commonService.getElementTop(origin.parentElement);
    let originScroll = originTop - scroll;

    const copyOrigin = origin.cloneNode(true);
    const copyDom = this.copyElementRef.nativeElement;

    let y = containHeight - originTop + scroll - (originHeight / 2);
    y += document.documentElement.scrollTop;
    const x = Math.abs(containWidth - originLeft);

    if (documentScrollTop > originScroll) {
      originScroll = documentScrollTop;
      y = containHeight - (originHeight / 2);
    }

    this.renderer.appendChild(copyDom, copyOrigin);
    this.renderer.setStyle(copyDom, 'position', 'absolute');
    this.renderer.setStyle(copyDom, 'left', `${originLeft}px`);
    this.renderer.setStyle(copyDom, 'top', `${originScroll}px`);
    this.renderer.setStyle(copyDom, 'z-index', '999');
    this.renderer.setStyle(copyDom, 'transition-duration', '1000ms');
    this.renderer.setStyle(copyDom, 'transform', `translate(${x - 20}px, ${y}px) scale(0)`);
    // this.renderer.setStyle(copyDom, 'opacity', '1');
    this.renderer.setStyle(copyDom, 'background-color', '#e4efff');
    this.renderer.setStyle(copyDom, 'list-style-type', 'none');
    this.renderer.setStyle(copyDom, 'border', '1px solid #2d9fff');
    setTimeout(() => {
      this.renderer.removeStyle(copyDom, 'position');
      this.renderer.removeStyle(copyDom, 'left');
      this.renderer.removeStyle(copyDom, 'top');
      this.renderer.removeStyle(copyDom, 'z-index');
      this.renderer.removeStyle(copyDom, 'transition-duration');
      this.renderer.removeStyle(copyDom, 'transform');
      this.renderer.setStyle(copyDom, 'border', '0px solid #2d9fff');
      while (copyDom.firstChild) {
        copyDom.removeChild(copyDom.firstChild);
      }
    }, 500);
  }

  // 获取当前试卷在试题蓝中的试题总数
  getQuestionIdsCount(count: number[]): void {
    const ids = [];
    const b = new Set(count);
    this.paperQuestionSetChapters.forEach(chapter => {
      chapter.questionsContent.forEach(q => {
        ids.push(q.id);
      });
    });
    const intersection = Array.from(new Set([...ids].filter(x => b.has(x)))); // 交集
    if (intersection.length === ids.length) {
      this.isJoinAll = true;
    }
  }

  /*
  *  显示解析数据
  */
  showSolutionDialog(question: Question, type: string, event): void {
    this.preventDefaultClick(event);
    const bean = new SolveDialog();
    bean.question = question;
    bean.type = type;
    this.messageService.sendSolveDialogMessage(bean);
  }

  /*
 *  显示纠错对话框
 */
  showCorrectionDialog(question, event): void {
    this.preventDefaultClick(event);
    const bean = new CorrectionDialog();
    bean.questionId = question.id;
    bean.paperId = this.paperId;
    this.messageService.sendCorrectionDialogMessage(bean);
  }

  /*
  *  屏蔽解析窗口点击事件
  */
  preventDefaultClick(event): void {
    event = event || window.event;
    event.stopPropagation();
  }

  /*
  *  隐藏解析数据
  */
  hideSolutionDialog(): void {
    // this.isShowSolution = false;
  }

  /*
  *  初始化获取试卷信息
  */
  initPaperInfo() {
    this.subscribe = this.route.params.subscribe(params => {
      this.paperId = params['paperId'];
      this.type = +params['type'];
      this.mark = +params['mark'];
      this.isSyncPaper = +params['paperType'];

      this.time = (this.type === 1 ? '更新时间' : '组卷时间');
      this.isFromEbagEnter = (this.mark === 1 ? true : false);

      this.isShowDifficulty = (this.propertyService.readStageId() === PRIMARY_SCHOOL) ? false : this.type === 2 ? false : true;

      if (this.isSyncPaper === 3) {
        this.paperService.getSyncPaperInfo(this.paperId, true).subscribe(response => {
          this.paperInfo = response.F_info;
          this.paperData = this.paperInfo.F_data;
          this.paperDate = this.paperData.date.substring(0, 10);
          this.paperDifficulty = this.utils.matchingDifficulty(this.paperData.difficulty);
          this.utils.setResGradeType(this.paperInfo.F_data.phase);
          this.fullScore = this.paperData.fullScore;
          this.title = this.paperInfo.F_title;
          this.typeName = this.paperData.typeName;

          this.paperQuestionSetChapters = this.commonService.dealData(this.paperData.questionSet.paperQuestionSetChapters);
          this.totalCount = this.commonService.getQuestionTotalCount(this.paperQuestionSetChapters);
          if (!this.isFromEbagEnter) {
            this.getQuestionBasket(this.paperInfo.F_data.courseId);
          }

        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log('An error occurred:', err.error.message);
          } else {
            console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
        });
      } else {
        this.paperService.getPaperInfo(this.paperId, true).subscribe(response => {
          this.paperInfo = response.F_info;
          this.paperData = this.paperInfo.F_data;
          this.paperDate = this.paperData.date.substring(0, 10);
          this.paperDifficulty = this.utils.matchingDifficulty(this.paperData.difficulty);
          this.utils.setResGradeType(this.paperInfo.F_data.phase);
          this.fullScore = this.paperData.fullScore;
          this.title = this.paperInfo.F_title;
          this.typeName = this.paperData.typeName;

          this.paperQuestionSetChapters = this.commonService.dealData(this.paperData.questionSet.paperQuestionSetChapters);
          this.totalCount = this.commonService.getQuestionTotalCount(this.paperQuestionSetChapters);
          if (!this.isFromEbagEnter) {
            this.getQuestionBasket(this.paperInfo.F_data.courseId);
          }

        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
        });
      }
    }, error => console.log('Details router params: ' + error));
  }

  /*
 *  过滤标签
 */
  translateHtml(data) {
    return this.utils.matchingPp(data);
  }

  transformSubQuestionContent(content: string, index: number) {
    // return this.utils.getQuestionSerialNumber(content, index + 1, 1);
  }

  joinQuestionBasket(question: Question) {
    this.temp = question;
    const basket = new QuestionBasket();
    basket.question = question;
    basket.mark = 1;
    basket.isJoinAll = false;
    this.messageService.joinQuestionBasket(basket);

    // 加入试题篮动画
    this.questionId = question.id;
    // this.joinBasketAnimation();
  }

  removeFromQuestionBasket(question: Question) {
    this.temp = question;
    const basket = new QuestionBasket();
    basket.question = question;
    basket.mark = 2;
    this.isJoinAll = false;
    this.messageService.removeFromQuestionBasket(basket);
  }

  joinAllQuestionsBasket() {
    this.messageService.sendAddAllQuestionsMessage(this.paperQuestionSetChapters);
  }

  // 请求是否要清空试题篮
  // removeAllQuestionsFromBasket() {
  //   this.messageService.sendDialogMessage(REMOVE_ALL_FROM_QUESTION_BASKET);
  // }
  removeAllQuestionsFromBasket() {
    if (!this.paperQuestionSetChapters.length) {
      return;
    }
    const ids = [];
    this.paperQuestionSetChapters.forEach(chapter => {
      chapter.questionsContent.forEach(q => {
        ids.push(q.id);
      });
    });
    this.questionIds = ids;
    this.messageService.sendPaperDetailIds(this.questionIds);
  }

  updateStatus() {
    this.updateStatusSubscription = this.messageService.getUpdateStatusObservable().subscribe(params => {
      if (typeof params === 'number') {
        const param: number = params;
        if (param === 0) {
          if (this.temp.isJoinQuestionBasket) {
            this.temp.isJoinQuestionBasket = false;
            this.joinedQuestionBasketCount--;
          } else {
            this.temp.isJoinQuestionBasket = true;
            this.joinedQuestionBasketCount++;
            this.joinBasketAnimation();
          }
        } else {
          const status = (param === 1 ? true : false);
          this.isJoinAll = status;
          this.totalCount = status ? this.totalCount : 0;
          this.paperQuestionSetChapters.forEach((chapter, index) => {
            chapter.questionsContent.forEach((question, questionIndex) => {
              question.isJoinQuestionBasket = status;
            });
          });
        }
      } else {
        // 如果删除的类型里面有id属于这里，则置为全部加入试题蓝
        const questionType: QuestionsBasket = params;
        this.paperQuestionSetChapters.forEach((chapter, chapterIndex) => {
          questionType.questions.split(',').forEach((id, index) => {
            const list = chapter.questionsContent.filter(item => item.id === +id);
            if (list.length > 0) {
              this.isJoinAll = false;
              list[0].isJoinQuestionBasket = false;
              this.joinedQuestionBasketCount--;
            }
          });
        });
        this.totalCount -= questionType.questions.split(',').length;
      }
    });
  }

  getQuestionBasket(courseId: number) {
    this.paperService.getQuestionBasket(this.propertyService.readTeacherId(), courseId).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        const list: QuestionsBasket[] = response.F_data;
        list.forEach((item, index) => {
          item.questions.split(',').forEach((id, idIndex) => {
            this.paperQuestionSetChapters.some((chapter, chapterIndex) => {
              const temp = chapter.questionsContent.filter(question => question.id === +id);
              if (temp.length > 0) {
                temp[0].isJoinQuestionBasket = true;
                this.joinedQuestionBasketCount++;
                return true;
              }
            });
          });
        });
        let arr = [];
        response.F_data.forEach((item, index) => {
          this.totalCount += item.questionCount;
          arr = arr.concat(item.questions.split(',').map(v => +v));
        });
        // this.isJoinAll = (this.joinedQuestionBasketCount === this.totalCount) ? true : false;
        this.getQuestionIdsCount(arr);
      }
    }, error => console.log('Get question fail: ' + error));
  }

  public isShowDownloadAns(): void {
    if (this.paperId) {
      // 我的组卷才能保存答题卡
      const asMode = this.type === 2 ? 1 : 2;
      this.router.navigate(['/answer-sheet', this.paperId, asMode]);
    } else {
      alert('加载失败!');
    }
  }

  download() {
    this.isShowDownloadPaper = true;
    this.errorTipActive = false;
    this.isPrintPaper = true;
  }

  isCloseDownloadPaper(isClose: boolean): void {
      this.isShowDownloadPaper = isClose;
      this.isPrintPaper = isClose;
  }


  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.subscribe !== undefined) {
      this.subscribe.unsubscribe();
    }

    if (this.loaderSubscription !== undefined) {
      this.loaderSubscription.unsubscribe();
    }

    if (this.updateStatusSubscription !== undefined) {
      this.updateStatusSubscription.unsubscribe();
    }

    if (this.removeAllFromQuestionBasketSubscription !== undefined) {
      this.removeAllFromQuestionBasketSubscription.unsubscribe();
    }

    if (this.basketIdsSub) {
      this.basketIdsSub.unsubscribe();
    }
  }
}
