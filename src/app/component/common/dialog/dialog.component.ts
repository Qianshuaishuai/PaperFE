import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import {
  DELETE_PROMPT_MESSAGE, QUESTION_BASKET_NULL_MESSAGE, DELETE_MINE_PAPER_MESSAGE,
  JOIN_QUESTION_BASKET_LIMIT_NUMBER_MESSAGE,
  QUESTION_BASKET_DELETE_QUESTION_TYPE,
  PREVIEW_PAPER_DELETE_QUESTION,
  CLICK_GENERATE_PAPER,
  DELETE_MINI_PAPER,
  JOIN_QUESTION_BASKET_LIMIT_NUMBER,
  REMOVE_ALL_FROM_QUESTION_BASKET,
  REMOVE_ALL_FROM_QUESTION_BASKET_MESSAGE,
  SAVE_PAPER,
  SAVE_PAPER_MESSAGE,
} from '../../../constants';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, OnDestroy {

  isHidden = true;
  mark: number;
  dialogSubscription: Subscription;

  message = DELETE_PROMPT_MESSAGE;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.dialogSubscription = this.messageService.getDialogObservable().subscribe(mark => {
      this.mark = mark;
      this.message = (this.mark === QUESTION_BASKET_DELETE_QUESTION_TYPE || this.mark === PREVIEW_PAPER_DELETE_QUESTION)
        ? DELETE_PROMPT_MESSAGE : (this.mark === CLICK_GENERATE_PAPER)
          ? QUESTION_BASKET_NULL_MESSAGE : (this.mark === DELETE_MINI_PAPER)
            ? DELETE_MINE_PAPER_MESSAGE : (this.mark === JOIN_QUESTION_BASKET_LIMIT_NUMBER)
              ? JOIN_QUESTION_BASKET_LIMIT_NUMBER_MESSAGE : (this.mark === REMOVE_ALL_FROM_QUESTION_BASKET)
                ? REMOVE_ALL_FROM_QUESTION_BASKET_MESSAGE : (this.mark === SAVE_PAPER)
                    ? SAVE_PAPER_MESSAGE : '';
      this.isHidden = false;
    });
  }

  close() {
    this.isHidden = true;
  }

  cancel() {
    this.isHidden = true;
  }

  sure() {
    this.messageService.sendDialogSureMessage(this.mark);
    this.isHidden = true;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.dialogSubscription !== undefined) {
      this.dialogSubscription.unsubscribe();
    }
  }
}
