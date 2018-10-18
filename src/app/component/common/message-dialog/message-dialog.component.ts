import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit, OnDestroy {

  public isHidden = true;
  public message: string;
  private messageDialogSub: Subscription;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.messageDialogSub = this.messageService.getMessageDialog().subscribe(message => {
      this.message = message;
      this.isHidden = false;
    });
  }

  public close(): void {
    this.isHidden = true;
  }

  ngOnDestroy() {
    if (this.messageDialogSub) {
      this.messageDialogSub.unsubscribe();
    }
  }

}
