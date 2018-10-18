import { Component, OnInit, OnDestroy } from '@angular/core';
import { Courseware } from '../../../bean/courseware';
import { CoursewareResponse } from '../../../response/courseware-response';
import { HttpErrorResponse } from '@angular/common/http';
import { SUCCESS, PAPER, PRIMARY_SCHOOL } from '../../../constants';
import { Paper } from '../../../bean/paper';
import { PaperService } from '../../../service/paper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { MessageService } from '../../../service/message.service';
import { PropertyService } from '../../../service/property.service';
import { LoaderService } from '../../../service/loader.service';
import { LoaderState } from '../../../bean/loader-state';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss']
})
export class SearchListComponent implements OnInit, OnDestroy {
  DEFAULT_DEBOUNCE_TIME = 500;
  paperList: Paper[];
  selectedResourceList: Courseware[] = [];
  resourceIds: number[] = [];

  subscribe: Subscription;
  loaderSubscription: Subscription;
  deleteQuoteSubscription: Subscription;

  currentPage = 1;

  isEmpty: boolean;
  isShow: boolean;
  hasPrevious: boolean;
  hasNext: boolean;

  page: string;
  keyword: string;

  teacherId: string;
  accesstoken: string;
  periodId: string;
  moment: string;
  courseId: number;
  gradeId: number;
  paperTypeId = -1;
  provinceId: number;

  isLoading = true;

  type: number;

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
    this.accesstoken = this.propertyService.readAccesstoken();
    this.periodId = this.propertyService.readPeriodId();
    this.moment = this.propertyService.readMoment();

    this.subscribe = this.route.params.subscribe(params => {
      this.keyword = params['keyword'];
      this.courseId = params['courseId'];
      this.gradeId = params['gradeId'];
      this.provinceId = params['provinceId'];
      this.paperTypeId = params['paperTypeId'];
      const mark = +params['mark'];

      if (this.propertyService.readStageId() === PRIMARY_SCHOOL) {
        this.type = 2;
      } else {
        this.type = 1;
      }

      if (mark === 1) {
        this.messageService.sendClickCourse();
        this.currentPage = 1;
      }
      this.search(this.keyword, this.courseId, this.gradeId, this.provinceId, this.paperTypeId, this.currentPage, 0);
      // tslint:disable-next-line:no-shadowed-variable
    }, error => console.log('Search get router params fail: ' + error));

    this.loaderSubscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
      this.isLoading = state.show;
    });

    this.deleteQuoteSubscription = this.messageService.getCancelQuote().subscribe(id => {
      this.cancelQuote(id);
      // tslint:disable-next-line:no-shadowed-variable
    }, error => console.log('Delete quote fail: ' + error));
  }

  public downloadPaper(id: number) {
    this.isShowDownloadPaper = true;
  }

  public isCloseDownloadPaper(isClose: boolean): void {
    this.isShowDownloadPaper = isClose;
  }

  public downloadSheet(id: number) {
    this.router.navigate(['/answer-sheet', id, 2]);
  }

  search(keyword: string, courseId: number, gradeId: number, provinceId: number, paperTypeId: number, page: number, sortFlag: number) {
    if (this.keyword === undefined) {
      return;
    }

    // tslint:disable-next-line:max-line-length
    this.paperService.searchPaper(this.keyword.trim(), courseId, gradeId, provinceId, paperTypeId, 10, page, sortFlag, true).subscribe(searchResponse => {
      if (searchResponse.F_responseNo === SUCCESS) {

        searchResponse.F_list.forEach((item, index) => {
          item.name = item.name.replace(/\[mark\](.*?)\[\/mark\]/g, function ($0, $1) {
            const name = '\<mark\>' + $1 + '\<\/mark\>';
            return name;
          });
        });

        this.paperList = searchResponse.F_list;

         // 假设上一个类型的页面总数大于新的类型页面总数，设为当前类型页面总数
         if (searchResponse.F_totalPage < this.currentPage) {
          this.currentPage = searchResponse.F_totalPage;
          this.search(keyword, courseId, gradeId, provinceId, paperTypeId, this.currentPage, sortFlag);
          return;
        }

        this.showPagination(searchResponse.F_totalPage);
        this.messageService.sendParams([this.courseId, this.gradeId, this.provinceId, this.paperTypeId, 0]);

        this.paperService.getCoursewareList(this.accesstoken, this.moment, this.periodId, this.teacherId).subscribe(coursewareResponse => {
          if (coursewareResponse.F_responseNo === SUCCESS) {
            // tslint:disable-next-line:max-line-length
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

    if (this.loaderSubscription !== undefined) {
      this.loaderSubscription.unsubscribe();
    }

    if (this.deleteQuoteSubscription !== undefined) {
      this.deleteQuoteSubscription.unsubscribe();
    }
  }

  public onSelectPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.search(this.keyword, this.courseId, this.gradeId, this.provinceId, this.paperTypeId, pageNumber, 0);
  }

  quote(paper: Paper) {
    // tslint:disable-next-line:max-line-length
    this.paperService.quote(this.teacherId, this.accesstoken, this.periodId, this.moment, '[' + paper.id.toString() + ']').subscribe(response => {
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
    this.paperService.cancelQuote(this.accesstoken, this.moment, this.periodId, id.toString(), this.teacherId).subscribe(response => {
      if (response.F_responseNo === SUCCESS) {
        const resourceIdIndex: number = this.resourceIds.indexOf(id);
        if (resourceIdIndex > -1) {
          this.resourceIds.splice(resourceIdIndex, 1);
          this.paperList.forEach((item, index) => {
            if (item.id === id) {
              item.isQuote = false;
            }
          });
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
}
