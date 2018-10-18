import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { PaperService } from '../../../service/paper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Paper } from '../../../bean/paper';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import { Subscription, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SUCCESS, PAPER, DELETE_MINI_PAPER } from '../../../constants';
import { Courseware } from '../../../bean/courseware';
import { CoursewareResponse } from '../../../response/courseware-response';
import { MessageService } from '../../../service/message.service';
import { PropertyService } from '../../../service/property.service';
import { LoaderService } from '../../../service/loader.service';
import { LoaderState } from '../../../bean/loader-state';

@Component({
  selector: 'app-mine-paper',
  templateUrl: './mine-paper.component.html',
  styleUrls: ['./mine-paper.component.scss']
})
export class MinePaperComponent implements OnInit, OnDestroy, AfterViewInit {
  DEFAULT_DEBOUNCE_TIME = 500;

  paperList: Paper[];
  selectedResourceList: Courseware[] = [];
  resourceIds: number[] = [];

  subscribe: Subscription;
  paperListSubscription: Subscription;
  quoteSubscription: Subscription;
  cancelQuoteSubscription: Subscription;
  coursewareListSubscription: Subscription;
  loaderSubscription: Subscription;
  deleteQuoteSubscription: Subscription;
  deleteMinePaperCallbackSubscription: Subscription;

  courseId: number;
  gradeId: number;
  // provinceId: number;
  paperTypeId: number;
  currentPage = 1;

  isEmpty: boolean;
  isShow: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  isQuote: boolean;

  page: string;

  teacherId: string;
  accessToken: string;
  periodId: string;
  moment: string;

  isLoading = true;

  deletedPaperId: number;

  deleteDisplay = 'none';

  isShowDownloadPaper = false;
  entryType = 1;

  constructor(
    private paperService: PaperService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private propertyService: PropertyService,
    private loaderService: LoaderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    this.periodId = this.propertyService.readPeriodId();
    this.moment = this.propertyService.readMoment();

    this.loaderSubscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
      this.isLoading = state.show;
    }, error => console.log('Loading: ' + error));

    this.deleteQuoteSubscription = this.messageService.getCancelQuote().subscribe(id => {
      this.cancelQuote(id);
    }, error => console.log('Delete quote fail: ' + error));

    this.getRouterParams();
    this.deleteMinePaperCallback();
  }

  ngAfterViewInit(): void {
    if (this.messageService.getIsReturnFromDetail()) {
      const id = this.messageService.getEnterDom();
      setTimeout(() => {
        const enterDom = document.getElementById(id);
        if (!enterDom) {
          return;
        }
        enterDom.scrollIntoView({behavior: 'smooth'});
        enterDom.parentElement.parentElement.setAttribute('class', 'highlight');
        enterDom.focus();
      }, 500);
    }
  }

  getPaperList(teacherId: string, accesstoken: string, courseId: number, gradeId: number, paperTypeId: number, currentPage: number) {
    // tslint:disable-next-line:max-line-length
    this.paperListSubscription = this.paperService.getMinePaperList(teacherId, accesstoken, courseId, gradeId, paperTypeId, 10, currentPage, 0, true).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        // tslint:disable-next-line:max-line-length
        response.F_list.forEach((item, index) => {
          item.date = item.date.replace(/T/, ' ').replace(/\+08\:00/, '');
        });

        this.paperList = response.F_list;
        this.messageService.sendTotalPage(response.F_totalPage);

        this.showPagination(response.F_totalPage);
        // 最后一个参数（主要为了区别省份）：0 表示获取试卷列表；1 表示我的试卷列表
        this.messageService.sendParams([this.courseId, this.gradeId, 1, this.paperTypeId, 1]);
        this.coursewareListSubscription = this.paperService.getCoursewareList(this.accessToken, this.moment,
          this.periodId, this.teacherId).subscribe(coursewareResponse => {
            if (coursewareResponse.F_responseNo === SUCCESS) {
              this.detailCoursewareList(coursewareResponse);
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

  getRouterParams() {
    this.subscribe = this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      this.gradeId = params['gradeId'];
      this.paperTypeId = params['paperTypeId'];
      const mark = +params['mark'];

      if (mark === 1) {
        this.messageService.sendClickCourse();
        // this.currentPage = 1;
        this.currentPage = this.messageService.getLocatedPage();
        // this.paperTypeId = -1;
      }
      this.getPaperList(this.teacherId, this.accessToken, this.courseId, this.gradeId, this.paperTypeId, this.currentPage);
    }, error => console.log('Get Route Param Fail: ' + error));
  }

  deleteMinePaperCallback() {
    this.deleteMinePaperCallbackSubscription = this.messageService.getDialogSureObservable().subscribe(mark => {
      if (mark === DELETE_MINI_PAPER) {
        this.paperService.deleteMinePaper(this.propertyService.readTeacherId(),
          this.propertyService.readAccesstoken(), this.deletedPaperId).subscribe(response => {
            if (response.F_responseNo === SUCCESS) {
              this.paperList.some((item, index) => {
                if (item.id === this.deletedPaperId) {
                  this.paperList.splice(index, 1);
                  this.messageService.sendPromptMessage('删除组卷成功');
                  // if (item.isQuote) {
                  //   this.cancelQuote(item.id, false);
                  // }
                  this.getPaperList(this.teacherId, this.accessToken, this.courseId, this.gradeId, this.paperTypeId, this.currentPage);
                  return true;
                }
              });
            }
          });
      }
    });
  }

  public onSelectPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getPaperList(this.teacherId, this.accessToken, this.courseId, this.gradeId, this.paperTypeId, this.currentPage);
  }

  delete(id: number) {
    this.deletedPaperId = id;
    this.messageService.sendDialogMessage(DELETE_MINI_PAPER);
  }

  // public downloadPaper(id: number) {
  //   this.isShowDownloadPaper = true;
  // }

  public isCloseDownloadPaper(isClose: boolean): void {
    this.isShowDownloadPaper = isClose;
  }

  public downloadSheet(id: number) {
    this.router.navigate(['/answer-sheet', id, 1]);
  }

  quote(paper: Paper) {
    // tslint:disable-next-line:max-line-length
    this.quoteSubscription = this.paperService.quote(this.teacherId, this.accessToken, this.periodId, this.moment, '[' + paper.id.toString() + ']').subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        const courseware: Courseware = new Courseware();
        courseware.F_resource_id = paper.id;
        courseware.F_title = '试卷： ' + paper.name;
        courseware.F_type_detail = PAPER;
        this.selectedResourceList.push(courseware);
        this.messageService.sendSelectedResourceList(this.selectedResourceList);

        this.resourceIds.push(paper.id);
        paper.isQuote = true;
        paper.referenceCount += 1;
        this.messageService.sendPromptMessage('引用成功');
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

  cancelQuote(id: number) {
    // tslint:disable-next-line:max-line-length
    this.cancelQuoteSubscription = this.paperService.cancelQuote(this.accessToken, this.moment, this.periodId, id.toString(), this.teacherId).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        const resourceIdIndex: number = this.resourceIds.indexOf(id);
        if (resourceIdIndex > -1) {
          // this.resourceIds.splice(resourceIdIndex, 1);
          this.paperList.forEach((item, index) => {
            if (item.id === id) {
              item.isQuote = false;
            }
          });
          // paper.isQuote = false;
        }

        this.selectedResourceList.every((item, index) => {
          if (item.F_resource_id === id) {
            this.selectedResourceList.splice(index, 1);
            this.messageService.sendSelectedResourceList(this.selectedResourceList);
            return false;
          } else {
            return true;
          }
        });

        this.messageService.sendPromptMessage('取消引用成功');
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

  public showPagination(totalPage: number): void {
    if (this.paperList.length > 0) {
      this.isEmpty = false;
    } else {
      this.isEmpty = true;
    }
    if (totalPage > 1) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  detailCoursewareList(response: CoursewareResponse) {
    const coursewareList: Courseware[] = response.F_list;

    if (coursewareList !== undefined) {
      this.selectedResourceList.length = 0;
      this.selectedResourceList = this.selectedResourceList.concat(coursewareList);
      this.messageService.sendSelectedResourceList(this.selectedResourceList);

      this.paperList.forEach((item, index) => {
        // tslint:disable-next-line:max-line-length
        of(coursewareList).pipe(map(coursewares => coursewares.filter(courseware => courseware.F_resource_id === item.id))).subscribe(coursewares => {
          if (coursewares.length > 0) {
            item.isQuote = true;
            this.resourceIds.push(item.id);
          }
        });
      });
    }
  }

  mouseEnter(paper: Paper) {
    paper.isShowDeleteBtn = true;
  }

  mouseLeave(paper: Paper) {
    paper.isShowDeleteBtn = false;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.subscribe !== undefined) {
      this.subscribe.unsubscribe();
    }

    if (this.coursewareListSubscription !== undefined) {
      this.coursewareListSubscription.unsubscribe();
    }

    if (this.paperListSubscription !== undefined) {
      this.paperListSubscription.unsubscribe();
    }

    if (this.quoteSubscription !== undefined) {
      this.quoteSubscription.unsubscribe();
    }

    if (this.cancelQuoteSubscription !== undefined) {
      this.cancelQuoteSubscription.unsubscribe();
    }

    if (this.loaderSubscription !== undefined) {
      this.loaderSubscription.unsubscribe();
    }

    if (this.deleteQuoteSubscription !== undefined) {
      this.deleteQuoteSubscription.unsubscribe();
    }

    if (this.deleteMinePaperCallbackSubscription !== undefined) {
      this.deleteMinePaperCallbackSubscription.unsubscribe();
    }
  }

  enterDetail(event: any): void {
    this.messageService.setLocatedPage(this.currentPage);
    this.messageService.setEnterDom(event.currentTarget.id);
  }
}
