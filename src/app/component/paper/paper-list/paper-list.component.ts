import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren } from '@angular/core';
import { PaperService } from '../../../service/paper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Paper } from '../../../bean/paper';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import { Subscription } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SUCCESS, PAPER } from '../../../constants';
import { Courseware } from '../../../bean/courseware';
import { CoursewareResponse } from '../../../response/courseware-response';
import { MessageService } from '../../../service/message.service';
import { PropertyService } from '../../../service/property.service';
import { LoaderService } from '../../../service/loader.service';
import { LoaderState } from '../../../bean/loader-state';
import { Bookname } from '../../../bean/bookname';

@Component({
  selector: 'app-paper-list',
  templateUrl: './paper-list.component.html',
  styleUrls: ['./paper-list.component.scss']
})


export class PaperListComponent implements OnInit, AfterViewInit, OnDestroy {
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
  bookNameSub: Subscription;
  versionSub: Subscription;

  courseId: number;
  gradeId: number;
  provinceId: number;
  paperTypeId: number;
  bookId: number;
  currentPage = 1;

  isEmpty: boolean;
  isShow: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  isQuote: boolean;

  teacherId: string;
  accessToken: string;
  periodId: string;
  moment: string;

  type: number;

  isLoading = true;
  isSyncPaper = false;

  isShowDownloadPaper = false;
  entryType = 1;

  bookName: string;
  syncVersion: Bookname;

  // @ViewChildren('paperLi') paperLi;

  constructor(
    private paperService: PaperService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private propertyService: PropertyService,
    private loaderService: LoaderService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    this.periodId = this.propertyService.readPeriodId();
    this.moment = this.propertyService.readMoment();

    this.subscribe = this.route.params.subscribe(params => {

      this.courseId = params['courseId'];
      this.gradeId = params['gradeId'];
      this.provinceId = +params['provinceId'];
      this.paperTypeId = params['paperTypeId'];
      const mark = +params['mark'];

      if (mark === 1) {
        this.messageService.sendClickCourse();
        // this.currentPage = 1;
        this.currentPage = this.messageService.getLocatedPage();
      }

      // 根据 provinceId 判断是否同步试卷 如果 长度大于4 则为同步试卷
      if (this.provinceId === 0 || this.provinceId === 1165 || this.provinceId === 7143 || this.provinceId === 1143 ||
        this.provinceId === 1145 || this.provinceId.toString().length > 4) {
        this.isSyncPaper = true;
        this.bookId = this.provinceId;
        this.messageService.sendParams([this.courseId, this.gradeId, this.bookId, this.paperTypeId, 0]);
        if (this.provinceId === 1165 || this.provinceId === 7143 || this.provinceId === 1143 || this.provinceId === 1145 ||
          this.provinceId.toString().length > 4) {
          this.messageService.sendTotalPage(-1);
          this.getSyncPaperList(this.courseId, this.bookId, this.paperTypeId, this.currentPage);
        }
      } else {
        this.isSyncPaper = false;
        this.messageService.sendTotalPage(-1);
        this.getPaperList(this.courseId, this.gradeId, this.provinceId, this.paperTypeId, this.currentPage);
      }
    }, error => console.log('Get Route Param Fail: ' + error));

    this.loaderSubscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
      this.isLoading = state.show;
    });

    this.deleteQuoteSubscription = this.messageService.getCancelQuote().subscribe(id => {
      this.cancelQuote(id);
    }, error => console.log('Delete quote fail: ' + error));

    this.bookNameSub = this.messageService.getBookName().subscribe(bookName => {
      this.bookName = bookName;
    });

    this.versionSub = this.messageService.getSyncVersion().subscribe(version => {
      this.syncVersion = version;
    });

  }

  ngAfterViewInit(): void {
    /*
    console.log(this.paperLi);
    */
    if (this.messageService.getIsReturnFromDetail()) {
      const id = this.messageService.getEnterDom();
      const intervalId = window.setInterval(() => {
        const enterDom = document.getElementById(id);
        if (enterDom) {
          window.clearInterval(intervalId);
          enterDom.scrollIntoView({behavior: 'smooth'});
          enterDom.parentElement.parentElement.setAttribute('class', 'highlight');
        }
      }, 10);
    }
  }

  // public downloadPaper(id: number) {
  //   this.isShowDownloadPaper = true;
  // }

  public isCloseDownloadPaper(isClose: boolean): void {
    this.isShowDownloadPaper = isClose;
  }

  public downloadSheet(id: number) {
    // 2 表示从套卷进入答题卡
    this.router.navigate(['/answer-sheet', id, 2]);
  }

  /**
   * 获取 同步试卷
   */
  getSyncPaperList(courseId: number, bookId: number, paperTypeId: number, currentPage: number) {
    this.paperListSubscription = this.paperService.getSyncPaperList(courseId, bookId, paperTypeId, 10,
      currentPage, true).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        this.paperList = response.F_list;
        this.messageService.sendTotalPage(response.F_totalPage);

        // 假设上一个类型的页面总数大于新的类型页面总数，设为当前类型页面总数
        if (response.F_totalPage < this.currentPage) {
          this.currentPage = response.F_totalPage;
          this.getSyncPaperList(courseId, bookId, paperTypeId, this.currentPage);
          return;
        }

        this.showPagination(response.F_totalPage);
        // 最后一个参数（主要为了区别省份）：0 表示获取试卷列表；1 表示我的试卷列表
        // this.messageService.sendParams([this.courseId, this.gradeId, 0, this.paperTypeId, 0]);

        this.coursewareListSubscription = this.paperService.getCoursewareList(this.accessToken, this.moment, this.periodId,
          this.teacherId).subscribe(coursewareResponse => {
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
    });
  }

  /**
   * 获取 套卷
   */
  getPaperList(courseId: number, gradeId: number, provinceId: number, paperTypeId: number, currentPage: number) {
    // tslint:disable-next-line:max-line-length
    this.paperListSubscription = this.paperService.getPaperList(courseId, gradeId, provinceId, paperTypeId, 10, currentPage, 0, true).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        // tslint:disable-next-line:max-line-length
        this.paperList = response.F_list;
        this.messageService.sendTotalPage(response.F_totalPage);
        // 假设上一个类型的页面总数大于新的类型页面总数，设为当前类型页面总数
        if (response.F_totalPage < this.currentPage) {
          this.currentPage = response.F_totalPage;
          this.getPaperList(courseId, gradeId, provinceId, paperTypeId, this.currentPage);
          return;
        }

        this.showPagination(response.F_totalPage);
        // 最后一个参数（主要为了区别省份）：0 表示获取试卷列表；1 表示我的试卷列表
        this.messageService.sendParams([this.courseId, this.gradeId, this.provinceId, this.paperTypeId, 0]);

        this.coursewareListSubscription = this.paperService.getCoursewareList(this.accessToken, this.moment, this.periodId,
          this.teacherId).subscribe(coursewareResponse => {
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

    if (this.bookNameSub) {
      this.bookNameSub.unsubscribe();
    }

    if (this.versionSub) {
      this.versionSub.unsubscribe();
    }
  }

  public onSelectPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    if (this.isSyncPaper) {
      this.getSyncPaperList(this.courseId, this.bookId, this.paperTypeId, this.currentPage);
    } else {
      this.getPaperList(this.courseId, this.gradeId, this.provinceId, this.paperTypeId, this.currentPage);
    }
  }

  quote(paper: Paper) {
    // tslint:disable-next-line:max-line-length
    if (this.isSyncPaper) {
      this.quoteSubscription = this.paperService.quoteSyncPaper(this.teacherId, this.accessToken, this.periodId, this.moment, '[' + paper.id.toString() + ']').subscribe(response => {
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
    } else {
      this.quoteSubscription = this.paperService.quote(this.teacherId, this.accessToken, this.periodId,
        this.moment, '[' + paper.id.toString() + ']').subscribe(response => {
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
        of (coursewareList).pipe(map(coursewares => coursewares.filter(courseware => courseware.F_resource_id === item.id))).subscribe(coursewares => {
          if (coursewares.length > 0) {
            item.isQuote = true;
            this.resourceIds.push(item.id);
          }
        });
      });
    }
  }

  enterDetail(event: any): void {
    this.messageService.setLocatedPage(this.currentPage);
    this.messageService.setEnterDom(event.currentTarget.id);
  }
}
