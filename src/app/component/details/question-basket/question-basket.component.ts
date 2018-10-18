import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, Output, EventEmitter, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../service/message.service';
import { MinePaper } from '../../../bean/mine-paper';
import { Question } from '../../details/paper-details/data/paperDetailsResponse';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from '../../../utils';
import { PropertyService } from '../../../service/property.service';
import { QuestionBasket } from '../../../bean/question-basket';
import { PaperService } from '../../../service/paper.service';
import { QuestionsBasket } from '../../../response/question-basket-response';
import { Router } from '@angular/router';
import { SUCCESS, QUESTION_BASKET_MAX_NUMBER, JOIN_QUESTION_BASKET_LIMIT_NUMBER, QUESTION_BASKET_DELETE_QUESTION_TYPE,
  CLICK_GENERATE_PAPER } from '../../../constants';
import * as _ from 'lodash';

@Component({
  selector: 'app-question-basket',
  templateUrl: './question-basket.component.html',
  styleUrls: ['./question-basket.component.scss']
})
export class QuestionBasketComponent implements OnInit, OnDestroy {

  @Output() questionCount = new EventEmitter<number[]>();

  // 控制试题篮状态
  isOpen = false;

  imgSource = 'assets/imgs/close_basket.png';

  questionBasketSubscription: Subscription;
  dialogSubscription: Subscription;
  allQuestionsSubscription: Subscription;
  updateQuestionBasketSubscription: Subscription;
  detailIdsSubscription: Subscription;

  paper: MinePaper = new MinePaper;

  questionTypeList: QuestionsBasket[] = [];
  tempQuestionTypeList: QuestionsBasket[] = [];
  questionContent: Question[] = [];
  questionIds: number[] = [];

  deletedQuestionType: QuestionsBasket;

  totalCount = 0;

  @ViewChild('basket') basket: ElementRef;

  constructor(
    private messageService: MessageService,
    private propertyService: PropertyService,
    private utils: Utils,
    private paperService: PaperService,
    private router: Router,
    private rd: Renderer2
  ) { }

  ngOnInit() {
    this.getQuestionBasket();

    this.addOrRemoveQuestion();

    this.addOrRemoveAllQuestions();

    // mark: 5 清空整个试题篮
    // 清空试题篮，按题型清空试题篮
    this.dialogSubscription = this.messageService.getDialogSureObservable().subscribe(mark => {
      if (mark === QUESTION_BASKET_DELETE_QUESTION_TYPE) {
        const index = this.tempQuestionTypeList.indexOf(this.deletedQuestionType);
        const arr = this.deletedQuestionType.questions.split(',').map(v => +v);
        _.difference(this.questionIds, arr);

        this.tempQuestionTypeList.splice(index, 1);

        if (index > -1) {
          this.updateQuestionBasket(JSON.stringify(this.tempQuestionTypeList), 3, index);
        }
      }
    }, error => console.log('Dialog sure: ' + error));

    this.detailIdsSubscription = this.messageService.getPaperDetailIds().subscribe(detailIds => {
      detailIds.forEach(id => {
        this.tempQuestionTypeList.forEach(temp => {
            temp.questions = temp.questions.split(',').filter(qId => {
            if (+qId === id) {
              temp.questionCount--;
            } else {
              return qId;
            }
          }).join();
        });
      });
      this.questionIds = [];
      this.tempQuestionTypeList = this.tempQuestionTypeList.filter(temp => temp.questionCount !== 0);
      this.updateQuestionBasket(JSON.stringify(this.tempQuestionTypeList), 5, -1);
    });

    setTimeout(() => {
      this.clickBasket();
    }, 500);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewChecked() {
    // Called after every check of the component's view. Applies to components only.
    // Add 'implements AfterViewChecked' to the class.
    const element = this.basket.nativeElement;
    this.rd.setStyle(element, 'margin-top', `${(-element.clientHeight / 2)}px`);
  }

  clickBasket() {
    const element = this.basket.nativeElement;
    if (this.isOpen) {
      this.imgSource = 'assets/imgs/close_basket.png';
      this.rd.setStyle(element, 'right', '0px');
      this.isOpen = false;
    } else {
      this.imgSource = 'assets/imgs/open_basket.png';
      this.rd.setStyle(element, 'right', '-200px');
      this.isOpen = true;
    }
  }

  instantiateQuestionType(question: Question, count: number): QuestionsBasket {
    const type: QuestionsBasket = new QuestionsBasket();
    type.type = question.type;
    type.name = this.utils.mapQuestionType(question.type);
    type.questionCount = count;
    type.questions = String(question.id);
    this.questionContent.push(question);
    return type;
  }

  addOrRemoveQuestion() {
    this.questionBasketSubscription = this.messageService.getQuestionBasket().subscribe(basket => {
      if (basket.mark === 1 && this.totalCount >= QUESTION_BASKET_MAX_NUMBER) {
        this.messageService.sendDialogMessage(JOIN_QUESTION_BASKET_LIMIT_NUMBER);
        return;
      }
      // 1 表示加入试题篮
      if (basket.mark === 1 && !basket.isJoinAll) {
        let arr = [];
        this.questionTypeList.forEach(q => {
          arr = arr.concat(q.questions.split(',').map(v => +v));
        });
        if (arr.indexOf(basket.question.id) < 0) {
          this.questionIds.push(basket.question.id);
          arr.push(basket.question.id);
          this.questionCount.emit(arr);
        }
      }
      // 2 表示移出试题篮
      if (basket.mark === 2) {
        const index = this.questionIds.indexOf(basket.question.id);
        this.questionIds.splice(index, 1);
      }
      of(this.tempQuestionTypeList).pipe(map(questionTypes =>
        questionTypes.filter(questionType => {
          // tslint:disable-next-line:no-unused-expression
          if ((questionType.type >= 10010 && questionType.type < 10016) &&
            (basket.question.type >= 10010 && basket.question.type < 10016)) {
            return true;
          } else {
            return questionType.type === basket.question.type;
          }
          // tslint:disable-next-line:no-shadowed-variable
        }))).subscribe(list => {
          if (list.length > 0) {
            if (basket.mark === 1) {
              list[0].questionCount++;
              list[0].questions += ',' + basket.question.id;
              this.questionContent.push(basket.question);
            } else if (basket.mark === 2) {
              if (list[0].questions.split(',').length > 0) {
                if (list[0].questions.split(',').length === 1) {
                  const index = this.tempQuestionTypeList.indexOf(list[0]);
                  if (index > -1) {
                    this.tempQuestionTypeList.splice(index, 1);
                    return;
                  }
                }

                const ids = list[0].questions.split(',');
                ids.every((item, index) => {
                  if (+item === basket.question.id) {
                    list[0].questionCount--;
                    this.questionContent.splice(index, 1);
                    ids.splice(index, 1);
                    let temp = '';
                    ids.forEach((id, idIndex) => {
                      temp += id + ',';
                    });
                    list[0].questions = temp.substring(0, temp.length - 1);
                    return false;
                  } else {
                    return true;
                  }
                });
              }
            }
          } else {
            this.tempQuestionTypeList.push(this.instantiateQuestionType(basket.question, 1));
          }
        });

      if (!basket.isJoinAll) {
        this.updateQuestionBasket(JSON.stringify(this.tempQuestionTypeList), basket.mark, -1);
      }
    }, error => console.log('Question basket error: ' + error));
  }

  addOrRemoveAllQuestions() {
    // 传 null 则移除所有试题
    // chapters 为全部加入试题蓝的试题
    this.allQuestionsSubscription = this.messageService.getAndAndRemoveAllQuestionsObservable().subscribe(chapters => {
      if (chapters) {
        if (this.totalCount === QUESTION_BASKET_MAX_NUMBER) {
          this.messageService.sendDialogMessage(JOIN_QUESTION_BASKET_LIMIT_NUMBER);
          return;
        }

        let count = 0;
        chapters.forEach((chapter, index) => {
          chapter.questionsContent.forEach((question, questionIndex) => {
            if (!question.isJoinQuestionBasket) {
              count++;
            }
          });
        });
        if (this.totalCount + count <= QUESTION_BASKET_MAX_NUMBER) {
          // 把所有题目加入试题篮 逐题加入
          this.questionContent.length = 0;
          chapters.forEach((chapter, index) => {
            chapter.questionsContent.forEach((question, questionIndex) => {
              let arr = [];
              this.questionTypeList.forEach(q => {
                arr = arr.concat(q.questions.split(',').map(v => +v));
              });
              if (arr.indexOf(question.id) > -1) {
                return;
              }
              const basket = new QuestionBasket();
              basket.question = question;
              basket.mark = 1;
              basket.isJoinAll = true;
              this.messageService.joinQuestionBasket(basket);
            });
          });
          this.updateQuestionBasket(JSON.stringify(this.tempQuestionTypeList), 4, -1);
        } else {
          this.messageService.sendDialogMessage(JOIN_QUESTION_BASKET_LIMIT_NUMBER);
        }
      } else {
        // 移除所有试题
        this.questionIds = [];
        this.tempQuestionTypeList.length = 0;
        this.updateQuestionBasket(JSON.stringify(this.tempQuestionTypeList), 5, -1);
      }
    }, error => console.log('Add or remove all questions: ' + error));
  }

  deleteQuestionType(questionType: QuestionsBasket) {
    this.deletedQuestionType = questionType;
    this.messageService.sendDialogMessage(QUESTION_BASKET_DELETE_QUESTION_TYPE);
  }

  calculateTotalCount() {
    this.totalCount = 0;
    this.questionTypeList.forEach((item, index) => {
      this.totalCount += item.questionCount;
    });
  }

  /**
   *
   * @param json 试题篮更新数据
   * @param mark 操作类型，主要为了弹出不同提示语。1 表示 ‘加入试题篮是否成功’；2 表示 ‘移出试题篮是否成功’
   *             3 表示 ‘删除试题篮是否成功’ 4 表示 ‘全部加入试题篮是否成功’ 5 表示 ‘全部移出试题篮是否成功’
   * @param index 删除 item 索引 默认值为 -1
   */
  updateQuestionBasket(json: string, mark: number, index: number) {
    let message = (mark === 1 ? '加入试题篮失败' : mark === 2 ? '移出试题篮失败' : mark === 3 ? '删除失败' :
      mark === 4 ? '全部移出试题篮成功' : '全部移出试题篮失败');
    this.updateQuestionBasketSubscription =
      // tslint:disable-next-line:max-line-length
      this.paperService.updateQuestionBasket(this.propertyService.readTeacherId(),
        this.propertyService.readSubjectId(), json).subscribe(response => {
          if (response.F_responseNo === SUCCESS) {
            if (mark === 1 || mark === 2) {
              message = (mark === 1 ? '加入试题篮成功' : '移出试题篮成功');
              this.messageService.sendUpdateStatusMessage(0);
            } else if (mark === 3) {
              message = '删除成功';

              // const index = this.questionTypeList.indexOf(this.deletedQuestionType);

              // this.questionTypeList.splice(index, 1);
              this.deletedQuestionType.questions.split(',').forEach((id, idIndex) => {
                this.questionContent.some((question, questionIndex) => {
                  if (question.id === +id) {
                    this.questionContent.splice(questionIndex, 1);
                    return false;
                  }
                });
              });
              this.messageService.sendUpdateStatusMessage(this.deletedQuestionType);
            } else if (mark === 4 || mark === 5) {
              const type = (mark === 4 ? 1 : 2);
              message = (mark === 4 ? '全部加入试题篮成功' : '全部移出试题篮成功');
              if (mark === 4) { this.questionIds = []; }
              this.messageService.sendUpdateStatusMessage(type);
            }
            this.questionTypeList = this.tempQuestionTypeList;
            this.messageService.sendPromptMessage(message);
            // this.propertyService.writeQuestionTypeList(json);
            this.calculateTotalCount();
          } else {
            this.messageService.sendPromptMessage(message);
            this.reset(mark);
          }
        }, error => {
          this.messageService.sendPromptMessage(message);
          this.reset(mark);
        });
  }

  reset(mark: number) {
    // 移出试题篮失败时重置临时变量 tempQuestionTypeList，防止数据不统一
    if (mark === 2 || mark === 3) {
      this.tempQuestionTypeList = this.questionTypeList;
    }
  }

  getQuestionBasket() {
    this.paperService.getQuestionBasket(this.propertyService.readTeacherId(), this.propertyService.readSubjectId()).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        this.questionTypeList = this.tempQuestionTypeList = response.F_data;
        response.F_data.forEach((item, index) => {
          this.totalCount += item.questionCount;
          this.questionIds = this.questionIds.concat(item.questions.split(',').map(v => +v));
        });
        this.clickBasket();
      }

    }, error => console.log('Get question basket failed: ' + error));
  }

  generatePaper() {
    if (this.totalCount > 0) {
      this.router.navigate(['/preview']);
    } else {
      this.messageService.sendDialogMessage(CLICK_GENERATE_PAPER);
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.questionBasketSubscription !== undefined) {
      this.questionBasketSubscription.unsubscribe();
    }

    if (this.dialogSubscription !== undefined) {
      this.dialogSubscription.unsubscribe();
    }

    if (this.allQuestionsSubscription !== undefined) {
      this.allQuestionsSubscription.unsubscribe();
    }

    if (this.updateQuestionBasketSubscription !== undefined) {
      this.updateQuestionBasketSubscription.unsubscribe();
    }

    if (this.detailIdsSubscription) {
      this.detailIdsSubscription.unsubscribe();
    }
  }
}
