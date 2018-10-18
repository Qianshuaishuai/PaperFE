import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PropertyService } from '../../../service/property.service';
import { MessageService } from '../../../service/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Paper } from '../../paper/paper-list/paper';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import { SelectorService } from '../../../service/selector.service';
import { Utils } from '../../../utils';
import { Course } from '../../../bean/course';
import { DEFAULT_GRADE_ID, JUNIOR_SCHOOL, SENIOR_SCHOOL, PRIMARY_SCHOOL } from '../../../constants';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  defaultGradeId = DEFAULT_GRADE_ID;

  courses: Course[];
  selectedSeniorCourse: Course;
  selectedJuniorCourse: Course;
  selectedPrimaryCourse: Course;

  paperList: Paper[];

  isShowMenu: boolean;
  isShowSelectedResource: boolean;
  currentSubject: string;

  getCoursesSubscription: Subscription;
  selectedCourseSubscription: Subscription;
  paramsSubscription: Subscription;
  searchModelSubscription: Subscription;
  clickPaperSubscription: Subscription;

  // stageId: any;
  background: string;
  color: string;

  selectResourceCount = 0;

  keyword = '';
  isSearchModel = false;
  // 1 表示套卷 2 表示试卷 3 表示同步试卷
  isClickMinePaper = 1;

  stageId: number;
  courseId: number;
  gradeId: number;
  teacherId: string;
  accesstoken: string;
  periodId: string;
  moment: string;

  paperBackground = '#1d88e2';
  minePaperBackground = '#2d9fff';
  syncPaperBackground = '#2d9fff';

  // 1 表示套卷 2 表示试卷 3 表示同步试卷
  currentNavigationStatus = 1;

  constructor(
    private selectorService: SelectorService,
    private properService: PropertyService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.stageId = this.activatedRoute.snapshot.queryParams['stageId'];
    if (this.activatedRoute.snapshot.firstChild && +this.activatedRoute.snapshot.firstChild.params['provinceId']) {
      const bookId = +this.activatedRoute.snapshot.firstChild.params['provinceId'];
      if (bookId === 0 || bookId === 1165 || bookId === 7143 || bookId === 1143 || bookId === 1145 || bookId.toString().length > 4) {
        this.currentNavigationStatus = 3;
        this.isClickMinePaper = 3;
      }
    }

    if (this.stageId) {
      this.stageId = this.utils.transform(this.activatedRoute.snapshot.queryParams['stageId']);
      this.courseId = this.utils.mapCourseId(this.stageId, +this.activatedRoute.snapshot.queryParams['subjectId']);
      this.gradeId = +this.activatedRoute.snapshot.queryParams['gradeId'];
      this.teacherId = this.activatedRoute.snapshot.queryParams['teacherId'];
      this.accesstoken = this.activatedRoute.snapshot.queryParams['accesstoken'];
      this.periodId = this.activatedRoute.snapshot.queryParams['periodId'];
      this.moment = this.activatedRoute.snapshot.queryParams['moment'];

      this.properService.writeProvinceId(1);
      this.properService.writeStageId(this.stageId);
      this.properService.writeOldStageId(this.stageId);
      this.properService.writeSubjectId(this.courseId);
      this.properService.writeOldSubjectId(this.courseId);
      this.properService.writeGradeId(this.gradeId);
      this.properService.writeOldGradeId(this.gradeId);
      this.properService.writeTeacherId(this.teacherId);
      this.properService.writeAccesstoken(this.accesstoken);
      this.properService.writePeriodId(this.periodId);
      this.properService.writeMoment(this.moment);
      this.properService.writeCurrentSubject(this.activatedRoute.snapshot.queryParams['currentSubject']);
      this.properService.writeChapterName(this.activatedRoute.snapshot.queryParams['chapterName']);
      this.properService.writeBookVersion(this.activatedRoute.snapshot.queryParams['currentBookVersion']);
      this.properService.writeBookId(this.activatedRoute.snapshot.queryParams['currentBookId']);
      this.properService.writeChapterId(this.activatedRoute.snapshot.queryParams['chapterId']);
      this.updateBackground(1);

      this.router.navigate(['/library', this.courseId, this.gradeId, 1, -1, 1]);
      // this.router.navigate(['/library', { outlets: { 'list': [courseId, gradeId, 1, -1, 1]}}]);
    } else {
      this.updateBackground(this.properService.readCurrentNavigationStatus() !== null ?
        this.properService.readCurrentNavigationStatus() : 1);
    }

    this.getSubjects();

    // 我的组卷
    if (this.activatedRoute.snapshot.firstChild && this.activatedRoute.snapshot.firstChild.url.length === 4) {
      this.isClickMinePaper = 2;
      this.checked(2);
    }
    this.searchModelSubscription = this.messageService.getSearchModel().subscribe(searchModel => {
      this.isSearchModel = searchModel.searchModel;
      this.keyword = searchModel.keyword;
      this.isClickMinePaper = 2;
    }, error => console.log('Menu search model: ' + error));

    this.clickPaperSubscription = this.messageService.getclickNavigationObservable().subscribe(isClickMinePaper => {
      this.isClickMinePaper = isClickMinePaper;
      this.isSearchModel = false;
    }, error => console.log('Click nav: ' + error));

    // 从备课本进来都锁定在组卷
    if (this.stageId !== undefined) {
      this.checked(1);
    }

    // 若是从答题卡返回
    if (this.activatedRoute.snapshot.firstChild && this.activatedRoute.snapshot.firstChild.params['provinceId'] === 'fhtbsj') {
      this.checked(3);
    }
  }

  public return(): void {
    window.close();
  }

  getSubjects(): void {
    this.getCoursesSubscription = this.selectorService.getCourses().pipe(map(response => response.F_courses)).subscribe(result => {
      this.courses = result;

      // 获取当前老师所属的阶段　id（小学、初中、高中）
      this.stageId = this.properService.readStageId();
      // 获取当前老师所选的科目 id
      this.courseId = this.properService.readSubjectId();
      this.gradeId = this.properService.readGradeId();

      // tslint:disable-next-line:max-line-length
      // this.router.navigate(['/library'], { queryParams: { courseId: courseId, gradeId: gradeId, provinceId: 1, paperTypeId: -1, mark: 1}});

      // tslint:disable-next-line:max-line-length
      this.selectedCourseSubscription = of(this.courses).pipe(map(courses => courses.filter(course => course.id === this.courseId))).subscribe(courses => {
        if (courses[0].phase === JUNIOR_SCHOOL) {
          this.currentSubject = '初中' + courses[0].name;
          this.selectedJuniorCourse = courses[0];
        } else if (courses[0].phase === SENIOR_SCHOOL) {
          this.currentSubject = '高中' + courses[0].name;
          this.selectedSeniorCourse = courses[0];
        } else if (courses[0].phase === PRIMARY_SCHOOL) {
          this.currentSubject = '小学' + courses[0].name;
          this.selectedPrimaryCourse = courses[0];
        }
      }, error => console.log('Selected Course: ' + error));

      this.paramsSubscription = this.messageService.getParams().subscribe(data => {
        of(this.courses).pipe(map(courses => courses.filter(course => course.id === +data[0]))).subscribe(list => {
          if (list[0].phase === JUNIOR_SCHOOL) {
            this.currentSubject = '初中' + list[0].name;
            this.selectedJuniorCourse = list[0];
          } else if (list[0].phase === SENIOR_SCHOOL) {
            this.currentSubject = '高中' + list[0].name;
            this.selectedSeniorCourse = list[0];
          } else if (list[0].phase === PRIMARY_SCHOOL) {
            this.currentSubject = '小学' + list[0].name;
            this.selectedPrimaryCourse = list[0];
          }
        });
      }, error => console.log('Params: ' + error));
      this.messageService.sendCourses(this.courses);
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

  selectPrimary(course: Course) {
    this.selectedPrimaryCourse = course;
    this.selectedJuniorCourse = null;
    this.selectedSeniorCourse = null;
    this.currentSubject = '小学' + course.name;
    this.isShowMenu = false;
    this.properService.writeStageId(PRIMARY_SCHOOL);
  }

  selectJunior(course: Course) {
    this.selectedPrimaryCourse = null;
    this.selectedJuniorCourse = course;
    this.selectedSeniorCourse = null;
    this.currentSubject = '初中' + course.name;
    this.isShowMenu = false;
    this.properService.writeStageId(JUNIOR_SCHOOL);
  }

  selectSenior(course: Course) {
    this.selectedPrimaryCourse = null;
    this.selectedJuniorCourse = null;
    this.selectedSeniorCourse = course;
    this.currentSubject = '高中' + course.name;
    this.isShowMenu = false;
    this.properService.writeStageId(SENIOR_SCHOOL);
  }

  mouseEnter(): void {
    this.isShowMenu = true;
  }

  mouseLeave(): void {
    this.isShowMenu = false;
  }

  /**
   * 控制选中状态
   * @param mark 1 表示套卷 2 表示我的试卷 3 表示同步试卷
   */
  checked(mark: number) {
    const courseId = this.properService.readSubjectId() !== null ? this.properService.readSubjectId() : 1;
    const gradeId = this.properService.readGradeId() !== null ? this.properService.readGradeId() : DEFAULT_GRADE_ID;
    let provinceId = this.properService.readProvinceId() !== null ? this.properService.readProvinceId() : 1;
    // const paperTypeId = this.properService.readPaperTypeId() !== null ? this.properService.readPaperTypeId() : -1;

    this.updateBackground(mark);

    if (provinceId === 0 && mark === 1) {
      provinceId = 1;
    }

    // provinceId 为0 表示跳转到同步试卷
    if (mark === 1) {
      this.messageService.sendclickNavigationMessage(1);
      // this.router.navigate(['/library', courseId, gradeId, provinceId, -1, 0]);
      this.router.navigate(['/library', courseId, gradeId, 1, -1, 0]);
    } else if (mark === 2) {
      this.messageService.sendclickNavigationMessage(2);
      if (this.messageService.getIsReturnFromDetail()) {
        this.router.navigate(['/library', courseId, gradeId, this.properService.readPaperTypeId(), 0]);
      } else {
        this.router.navigate(['/library', courseId, gradeId, -1, 0]);
      }
    } else if (mark === 3) {
      this.messageService.sendclickNavigationMessage(3);
      this.router.navigate(['/library', courseId, gradeId, 0, -1, 0]);
    }

    this.properService.writeCurrentNavigationStatus(mark);
  }

  updateBackground(mark: number) {
    if (mark === 1) {
      this.paperBackground = '#1d88e2';
      this.minePaperBackground = '#2d9fff';
      this.syncPaperBackground = '#2d9fff';
    } else if (mark === 2) {
      this.paperBackground = '#2d9fff';
      this.minePaperBackground = '#1d88e2';
      this.syncPaperBackground = '#2d9fff';
    } else if (mark === 3) {
      this.paperBackground = '#2d9fff';
      this.minePaperBackground = '#2d9fff';
      this.syncPaperBackground = '#1d88e2';
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.getCoursesSubscription !== undefined) {
      this.getCoursesSubscription.unsubscribe();
    }

    if (this.selectedCourseSubscription !== undefined) {
      this.selectedCourseSubscription.unsubscribe();
    }

    if (this.paramsSubscription !== undefined) {
      this.paramsSubscription.unsubscribe();
    }

    if (this.clickPaperSubscription !== undefined) {
      this.clickPaperSubscription.unsubscribe();
    }

    this.properService.writeCurrentNavigationStatus(+'');
    // this.properService.clear();
  }
}
