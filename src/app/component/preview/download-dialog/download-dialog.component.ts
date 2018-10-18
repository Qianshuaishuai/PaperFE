import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../service/message.service';
import { PropertyService } from '../../../service/property.service';

@Component({
  selector: 'app-download-dialog',
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.scss']
})
export class DownloadDialogComponent implements OnInit {

  @Input() savePaperId: number;
  @Output() isCloseDownloadDialog = new EventEmitter<boolean>();
  @Output() isShowSolutionArea = new EventEmitter<boolean>();

  public isShowDownloadPaper = false;
  private courseId: number;

  constructor(
    private router: Router,
    private propertyService: PropertyService
  ) { }

  ngOnInit() {
    this.courseId = this.propertyService.readOldSubjectId();
  }

  public closeDownloadDialog(): void {
    this.isCloseDownloadDialog.emit(false);
  }

  public isCloseDownloadPaper(isClose: boolean): void {
    this.isShowDownloadPaper = isClose;
    this.closeDownloadDialog();
  }

  public return(): void {
    this.propertyService.writeSubjectId(this.courseId);
    // this.router.navigate([`/library/${this.courseId}/100/-1/0`]);
    // 返回同步试卷
    // this.router.navigate([`/library/${this.courseId}/${this.propertyService.readGradeId()}/fhtbsj/-1/0`]);
    this.router.navigate([`/library/${this.courseId}/100/1/-1/0`]);
  }

  public isShowDownloadAns(): void {
    if (this.savePaperId) {
      this.router.navigate(['/answer-sheet', this.savePaperId, 1]);
    }
  }

  public show() {
    this.isShowSolutionArea.emit(true);
    this.isShowDownloadPaper = true;
  }

}
