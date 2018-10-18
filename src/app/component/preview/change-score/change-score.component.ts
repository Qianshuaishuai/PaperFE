import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../service/message.service';
import { Question, PaperQuestionSetChapter } from '../../details/paper-details/data/paperDetailsResponse';
import { SINGLE_CHOICE, OBJECTIVE_FILL, CLOZE, SEVEN_SELECT_FIVE } from '../../../constants';

@Component({
  selector: 'app-change-score',
  templateUrl: './change-score.component.html',
  styleUrls: ['./change-score.component.scss']
})
export class ChangeScoreComponent implements OnInit, OnDestroy {
  title = '';
  type: number;
  index: number;
  subIndex = 0;
  score = 0;
  totalScore = 0;
  questionCount: number;

  isHidden = true;
  isBatchChange = false;
  isChangeByQuestionType = true;

  question: Question;
  chapter: PaperQuestionSetChapter;

  changeScoreSubscription: Subscription;

  @ViewChild('container') container: ElementRef;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.changeScore();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewChecked() {
    // Called after every check of the component's view. Applies to components only.
    // Add 'implements AfterViewChecked' to the class.
    const element = document.getElementById('container');
    element.style.marginTop = (-element.clientHeight / 2) + 'px';
  }

  changeScore() {
    this.changeScoreSubscription = this.messageService.getChangeScoreObservable().subscribe((score) => {
      this.isBatchChange = score.isBatchChange;
      if (!this.isBatchChange) {
        this.question = score.question;
        this.type = this.question.type;
        this.index = score.index;
        this.subIndex = score.subIndex;
        this.score = this.question.score;
        this.title = '分数修改：';
      } else {
        this.chapter = score.chapter;
        this.type = this.chapter.type;
        this.questionCount = this.chapter.questionCount;
        this.subIndex = score.subIndex;
        this.score = 0;
        this.title = '根据题型批量修改分数：';

        if (this.type >= SINGLE_CHOICE && this.type <= OBJECTIVE_FILL ||
          this.type >= CLOZE && this.type <= SEVEN_SELECT_FIVE) {
            if (this.type >= CLOZE && this.type <= SEVEN_SELECT_FIVE) {
              this.questionCount = this.chapter.questionsContent[0].questions.length;
            }
            this.isChangeByQuestionType = true;
            this.totalScore = 0;
        } else {
            this.isChangeByQuestionType = false;
            this.totalScore = this.chapter.presetScore;
        }
      }
      this.isHidden = false;
    }, error => console.log('Change score fail: ' + error));
  }

  close() {
    this.isHidden = true;
  }

  sure() {
    if (this.isBatchChange) {
      if (this.isChangeByQuestionType) {
        if (this.type >= CLOZE && this.type <= SEVEN_SELECT_FIVE) {
          this.chapter.questionsContent[0].score = this.totalScore;
          this.chapter.questionsContent[0].questions.forEach((question, item) => {
            question.score = +this.score;
          });
        } else {
          this.chapter.questionsContent.forEach((item, index) => {
            item.score = +this.score;
          });
        }
        this.chapter.presetScore = this.totalScore;
        this.messageService.sendChangeScoreSureMessage(2);
      }
    } else {
      this.question.score = this.score;
      this.messageService.sendChangeScoreSureMessage(1);
    }

    this.isHidden = true;
  }

  cancel() {
    this.isHidden = true;
  }

  listenInput() {
    if (String(this.score).match('^[0-9]*$') !== null) {
      this.totalScore = this.score * this.questionCount;
    }
  }

  isHideBatchChangeScore(): boolean {
    if (this.isBatchChange) {
      return this.isChangeByQuestionType ? false : true;
    } else {
      return true;
    }
  }

  isHideNotBatchChangeScore(): boolean {
    if (this.isBatchChange) {
      return this.isChangeByQuestionType ? true : false;
    } else {
      return true;
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.changeScoreSubscription !== undefined) {
      this.changeScoreSubscription.unsubscribe();
    }
  }
}
