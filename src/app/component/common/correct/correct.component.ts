import { Component, OnInit, Input } from '@angular/core';
import { PropertyService } from '../../../service/property.service';
import { MessageService } from '../../../service/message.service';
import { PaperService } from '../../../service/paper.service';

@Component({
  selector: 'app-correct',
  templateUrl: './correct.component.html',
  styleUrls: ['./correct.component.scss']
})
export class CorrectComponent implements OnInit {

  @Input() questionId: number;

  teacherId: string;
  accessToken: string;
  choiceActives = [false, false, false, false, false];
  onSubmit = false;
  currentErrType = 4; // 错误类型默认为其它
  submitSuccess = false;
  content: string;

  constructor(
    private paperService: PaperService,
    private propertyService: PropertyService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
  }

  selectErrorType(type: number): void {
    this.choiceActives[type] = !this.choiceActives[type];
    if (this.choiceActives.some(choiceActive => choiceActive)) {
      this.onSubmit = true;
    } else {
      this.onSubmit = false;
    }
  }

  submit(value: string): void {
    if (!this.content) {
      this.messageService.sendMessageDialog('错误原因不能为空');
      return;
    }
    this.paperService.correctingAdd(this.teacherId, this.accessToken, this.questionId, 0, this.currentErrType, value)
    .subscribe(response => {
      const rNo = response.F_responseNo;
      if (rNo === 10000 || rNo === 10002) {
        this.submitSuccess = true;
      }
    });
  }

}
