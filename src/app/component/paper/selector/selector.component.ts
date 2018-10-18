import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { SelectorService } from '../../../service/selector.service';
import { Province } from '../../../bean/province';
import { Grade } from '../../../bean/grade';
import { Subscription, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaperType } from '../../../bean/paper-type';
import { Course } from '../../../bean/course';
import { ActivatedRoute } from '@angular/router';
import { RESOLUTION_1024, DEFAULT_GRADE_ID} from '../../../constants';
import { Utils } from '../../../utils';
import { MessageService } from '../../../service/message.service';
import { PropertyService } from '../../../service/property.service';
import { Bookname } from '../../../bean/bookname';
import { Book } from '../../../bean/book';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})

export class SelectorComponent implements OnInit, OnDestroy {
  grades: Grade [];
  types: PaperType[];
  regions: string [];
  provinces: Province [];
  originalProvinces: Province[];
  booknames: Bookname[];
  books: Book[];

  selectedGrade: Grade;
  selectedType: PaperType;
  selectedProvince: Province;
  selectedBookname: Bookname;
  selectedBook: Book;

  height: number;
  isFade = true;
  display: string;

  resolution: number;
  courseId = 42;
  gradeId = DEFAULT_GRADE_ID;
  provinceId = 1;
  paperTypeId = -1;

  lastPhase = 2;

  courses: Course[];

  isClickCourseSubscription: Subscription;
  paramsSubscription: Subscription;
  coursesSubscription: Subscription;
  gradeSubscription: Subscription;
  typeSubscription: Subscription;
  provinceSubscription: Subscription;
  booknameSubscription: Subscription;
  bookSubscription: Subscription;
  searchModelSubscription: Subscription;
  clickNavigationSubscription: Subscription;

  isSearchModel = false;
  // 1 表示套卷 2 表示我的试卷 3 表示同步试卷
  isClickMinePaper = 1;
  keyword = '';
  more = '查看更多';
  moreBooknames = '查看更多';
  moreBooks = '查看更多';

  suitType = 0;

  // 0 为默认值，0 表示获取组卷数据，1 表示获取同步试卷数据
  isSyncPaper = 0;

  teacherId: string;
  accessToken: string;

  booknamesCount: number;
  booksCount: number;
  isBooknameFade = false;
  isBookFade = false;

  BooknameElement: any;
  BookElement: any;

  BooknameHeight = 42;

  // tslint:disable-next-line:max-line-length
  constructor(
    private selectorService: SelectorService,
    private propertyService: PropertyService,
    private messageService: MessageService,
    private router: ActivatedRoute,
    private utils: Utils,
    private route: Router
  ) {
    this.resolution = window.screen.width;
  }

  ngOnInit() {
    // 根据路由参数决定selector选项是否显示
    // 如果 provinceId === 0  selector 为 同步试卷 状态
    if (this.router.snapshot.firstChild && +this.router.snapshot.firstChild.params['provinceId']) {
      const bookId = +this.router.snapshot.firstChild.params['provinceId'];
      if (bookId === 0 || bookId === 1165 || bookId === 7143 || bookId === 1143 || bookId === 1145 || bookId.toString().length > 4) {
        this.isClickMinePaper = 3;
        this.handleClickMinePaper(this.isClickMinePaper);
        this.courseId = +this.router.snapshot.firstChild.params['courseId'];
        this.gradeId = +this.router.snapshot.firstChild.params['gradeId'];

        // 同步试卷初始化 获取教材版本
        this.getBookNameList(this.courseId);
      } else {
        this.handleClickMinePaper(1);
      }
    } else {
      this.handleClickMinePaper(1);
    }
    this.provinces = [{id: 1, name: '全部'}];
    this.grades = [{gradeId: DEFAULT_GRADE_ID, name: '全部', paperCount: -1}];
    this.types = [{id: -1, name: '全部'}];

    this.lastPhase = this.propertyService.readStageId();
    if (this.lastPhase === null) {
      this.lastPhase = this.utils.transform(this.router.snapshot.queryParams['stageId']);
      this.propertyService.writeStageId(this.lastPhase);
    }

    this.getGrades(this.lastPhase, this.isSyncPaper);

    if (this.isClickMinePaper === 3) {
      this.getTypes(1);
    } else {
      this.getTypes(this.suitType);
    }
    this.getProvinces();

    this.isClickCourseSubscription =  this.messageService.getClickCourse().subscribe(isClickCourse => {
      if (isClickCourse) {
        this.selectedGrade = this.grades[0];
        this.selectedProvince = this.provinces[0];
      }
    // tslint:disable-next-line:no-shadowed-variable
    }, error => console.log('Click Course: ' + error));

    this.coursesSubscription = this.messageService.getCourses().subscribe(courses => {
      this.courses = courses;
    // tslint:disable-next-line:no-shadowed-variable
    }, error => console.log('Courses: ' + error));

    this.searchModelSubscription = this.messageService.getSearchModel().subscribe(searchModel => {
      this.isSearchModel = searchModel.searchModel;
      this.keyword = searchModel.keyword;
    // tslint:disable-next-line:no-shadowed-variable
    }, error => console.log('Search: ' + error));

    this.clickNavigationSubscription = this.messageService.getclickNavigationObservable().subscribe(isClickMinePaper => {
      this.isClickMinePaper = isClickMinePaper;
      this.handleClickMinePaper(this.isClickMinePaper);

      if (this.isClickMinePaper === 1) {
        this.isSyncPaper = 0;
        /*
        if (this.selectedProvince.id) {
          this.provinceId = this.selectedProvince.id;
          this._navigateProvince(this.provinceId);
        }
        */
        this.getTypes(this.suitType);
      } else if (this.isClickMinePaper === 3) {
        this.isSyncPaper = 1;
        this.getTypes(1);
      } else if (this.isClickMinePaper === 2) {
        this.getTypes(1);
      }
    });

    this.paramsSubscription = this.messageService.getParams().subscribe(data => {
      this.courseId = +data[0];
      this.gradeId = +data[1];
      this.provinceId = +data[2];
      this.paperTypeId = +data[3];

      // 如果是同步试卷，则根据courseId获取教材版本
      if (this.isClickMinePaper === 3 && this.provinceId === 0) {
        this.getBookNameList(this.courseId);
      }


      // 主要为了区别省份这个过滤条件，目前我的试卷列表没有这个条件
      // if (+data[4] === 0) {
      //   this.provinceId = +data[2];
      //   this.propertyService.writeProvinceId(this.provinceId);
      // } else {
      //   this.provinceId = 1;
      // }
      // this.utils.setResGradeType(this.courseId);
      this.propertyService.writeProvinceId(this.provinceId);
      this.propertyService.writeGradeId(this.gradeId);
      this.propertyService.writeSubjectId(this.courseId);
      this.propertyService.writePaperTypeId(this.paperTypeId);

      if (!this.courses) {
        return;
      }
      of(this.courses).pipe(map(courses => courses.filter(course => course.id === this.courseId))).subscribe(list => {
        if (list[0].phase !== this.lastPhase) {
          this.lastPhase = list[0].phase;
          this.getGrades(list[0].phase, this.isSyncPaper);

          this.propertyService.writeStageId(this.lastPhase);
          this.getTypes(this.suitType);
        }
      // tslint:disable-next-line:no-shadowed-variable
      }, error => console.log('Course: ' + error));

      this.gradeSubscription = of(this.grades)
        .pipe(map(grades => grades.filter(grade => grade.gradeId === this.gradeId)))
        .subscribe(list => {
        this.selectedGrade = list[0];
      // tslint:disable-next-line:no-shadowed-variable
      }, error => console.log('Selector Grade: ' + error));

      // tslint:disable-next-line:max-line-length
      // this.provinceSubscription = of(this.provinces).map(provinces => provinces.filter(province => province.id === this.provinceId)).subscribe(list => {
      //   this.selectedProvince = list[0];
      // // tslint:disable-next-line:no-shadowed-variable
      // }, error => console.log('Selector Province: ' + error));

      this.typeSubscription = of(this.types).pipe(map(types => types.filter(type => type.id === this.paperTypeId))).subscribe(list => {
        this.selectedType = list[0];
      // tslint:disable-next-line:no-shadowed-variable
      }, error => console.log('Selector Type: ' + error));
    // tslint:disable-next-line:no-shadowed-variable
    }, error => console.log('Selector Params: ' + error));

    if (this.propertyService.readCurrentNavigationStatus() === 2) {
      this.messageService.sendclickNavigationMessage(2);
    } else if (this.propertyService.readCurrentNavigationStatus() === 3) {
      this.messageService.sendclickNavigationMessage(3);
    }
  }

  // 根据路由更新省份状态
  private setSelectedProvince(): void {
    const routedProvinceId = +this.router.snapshot.firstChild.params['provinceId'];
    if (routedProvinceId && routedProvinceId !== 0 && routedProvinceId < 10000) {
      let index;
      for (index = 0; index !== this.provinces.length; index++) {
        if (this.provinces[index].id === routedProvinceId) {
          break;
        }
      }
      // 选中省份在更多那里
      if (index === this.provinces.length && index !== 1) {
        this._seeMoreProvince();
        for (index = 0; index !== this.provinces.length; index++) {
          if (this.provinces[index].id === routedProvinceId) {
            break;
          }
        }
      }
      this.selectProvince(this.provinces[index]);
    } else {
      this.selectProvince(this.provinces[0]);
    }
  }

  // 根据路由更新类型状态
  private setSelectedType(): void {
    const routedType = +this.router.snapshot.firstChild.params['paperTypeId'];
    let index;
    for (index = 0; index !== this.types.length; index++) {
      if (this.types[index].id === routedType) {
        break;
      }
    }
    this.selectType(this.types[index]);
  }

  _navigateProvince(provinceId: number): void {
    setTimeout(() => {
      this.route.navigate(['/library', this.courseId, this.gradeId, provinceId, this.paperTypeId, 0]);
    }, 17);
  }

  handleClickMinePaper(isClickMinePaper): void {
    const ProvinceElement = document.getElementById('province');
    const GradeElement = document.getElementById('grade');

    // 1 表示 套卷 2 表示 我的试卷 3 表示 同步试卷
    if (isClickMinePaper === 2) {
      ProvinceElement.style.display = 'none';
      GradeElement.style.display = 'none';
      this.suitType = 1;
    } else if (isClickMinePaper === 3) {
      ProvinceElement.style.display = 'none';
      GradeElement.style.display = 'none';
      this.suitType = 1;
    } else if (isClickMinePaper === 1) {
      ProvinceElement.style.display = 'inline-flex';
      GradeElement.style.display = 'inline-flex';
      this.suitType = 0;
    }
  }

  getGrades(phase: number, isSyncPaper: number): void {
    if (this.isClickMinePaper === 3) {
      isSyncPaper = 1;
    }
    this.selectorService.getGrades(phase, isSyncPaper).pipe(map(response => response.F_grades)).subscribe(result => {
      this.grades = [{gradeId: DEFAULT_GRADE_ID, name: '全部', paperCount: -1}];
      this.grades = this.grades.concat(result);

      let gradeId = this.propertyService.readGradeId();
      if (gradeId === null) {
        gradeId = +this.router.snapshot.queryParams['gradeId'];
        this.propertyService.writeGradeId(gradeId);
      }

      of(this.grades).pipe(map(grades => grades.filter(grade => grade.gradeId === gradeId))).subscribe(grades => {
        this.selectedGrade = grades[0];
      });
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

  getTypes(suitType: number): void {
    if (!(this.isClickMinePaper === 1)) {
      this.suitType = 1;
    }
    this.selectorService.getTypes(suitType, this.propertyService.readStageId()).subscribe(types => {
      this.types = [{id: -1, name: '全部'}];
      this.types = this.types.concat(types.F_paper_types);
      // 更新逻辑，从显示全部改为显示路由参数指定的类型
      // this.selectedType = this.types[0];
      this.setSelectedType();
    });
  }

  getProvinces(): void {
    this.selectorService.getProvinces().pipe(map(response => response.F_provinces)).subscribe(result => {
      this.originalProvinces = this.provinces.concat(result);
      if (this.resolution <= RESOLUTION_1024) {
        this.provinces = this.originalProvinces.slice(0, 8);
      } else {
        this.provinces = this.originalProvinces.slice(0, 11);
      }
      // 更新逻辑，从显示全部改为显示路由参数指定的省份
      // this.selectedProvince = this.provinces[0];
      this.setSelectedProvince();
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

  /**
   * 获取同步试卷 教材版本
   * @param {number} courseId
   */
  getBookNameList(courseId): void {
    this.booknameSubscription = this.selectorService.getBookNameList(courseId).subscribe(response => {
      this.booknamesCount = response.F_list.length;
      this.booknames = response.F_list;
      // 若是从试卷详情返回则要返回到上次进入的位置
      if (this.messageService.getIsReturnFromDetail()) {
        this.selectBookname(this.messageService.getSyncBookName());
        if (this.messageService.getIsBooknameFade()) {
          this.seeMore(2);
        }
      } else {
        this.selectBookname(this.booknames[0]);
      }
    });
  }

  /**
   * 获取同步试卷 教材
   * @param {string} bookname
   */
  getBooks(bookname): void {
    this.bookSubscription = this.selectorService.getBooks(this.courseId, bookname).subscribe(response => {
      if (!response.F_list) {
        return;
      }
      this.booksCount = response.F_list.length;
      this.books = response.F_list;
      if (this.messageService.getIsReturnFromDetail()) {
        this.selectBook(this.messageService.getSyncBook());
        if (this.messageService.getIsBookFade()) {
          this.seeMore(3);
        }
      } else {
        this.selectBook(this.books[0]);
      }
      this.route.navigate(['/library', this.courseId, this.gradeId, this.selectedBook.bookId, this.paperTypeId, 0]);
    });
  }

  selectGrade(grade: Grade) {
    this.selectedGrade = grade;
  }

  selectType(type: PaperType) {
    this.selectedType = type;
  }

  selectProvince(province: Province) {
    this.selectedProvince = province;
  }

  selectBookname(bookname: any) {
    this.getBooks(bookname);
    this.selectedBookname = bookname;
    this.messageService.sendSyncVersion(bookname);
    this.messageService.setSyncBookName(bookname.toString());
  }

  selectBook(book: Book) {
    this.selectedBook = book;
    this.messageService.sendBookName(book.bookName);
    this.messageService.setSyncBook(book);
  }

  // 1 表示 组卷的省份 2 表示 同步试卷的版本 3 表示同步试卷的教材
  seeMore(type: number) {
    if (type === 1) {
      this._seeMoreProvince();
    } else if (type === 2) {
      if (this.isBooknameFade) {
        this.isBooknameFade = false;
        this.moreBooknames = '查看更多';
      } else {
        this.isBooknameFade = true;
        this.moreBooknames = '收起更多';
      }
      this.messageService.setIsBooknameFade(this.isBooknameFade);
    } else if (type === 3) {
      if (this.isBookFade) {
        this.isBookFade = false;
        this.moreBooks = '查看更多';
      } else {
        this.isBookFade = true;
        this.moreBooks = '收起更多';
      }
      this.messageService.setIsBookFade(this.isBookFade);
    }
  }

  _seeMoreProvince() {
    if (this.isFade) {
      /*
      if (this.resolution === RESOLUTION_1024) {
        this.height = 254;
      } else {
        this.height = 216;
      }
      */
      this.isFade = false;
      this.provinces = this.originalProvinces;
      this.more = '收起更多';
    } else {
      // this.height = 142;
      this.isFade = true;
      this.more = '查看更多';
      if (this.resolution <= RESOLUTION_1024) {
        this.provinces = this.originalProvinces.slice(0, 8);
      } else {
        this.provinces = this.originalProvinces.slice(0, 11);
      }
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.isClickCourseSubscription !== undefined) {
      this.isClickCourseSubscription.unsubscribe();
    }

    if (this.paramsSubscription !== undefined) {
      this.paramsSubscription.unsubscribe();
    }

    if (this.coursesSubscription !== undefined) {
      this.coursesSubscription.unsubscribe();
    }

    if (this.gradeSubscription !== undefined) {
      this.gradeSubscription.unsubscribe();
    }

    if (this.provinceSubscription !== undefined) {
      this.provinceSubscription.unsubscribe();
    }

    if (this.typeSubscription !== undefined) {
      this.typeSubscription.unsubscribe();
    }

    if (this.searchModelSubscription !== undefined) {
      this.searchModelSubscription.unsubscribe();
    }

    if (this.isClickCourseSubscription !== undefined) {
      this.isClickCourseSubscription.unsubscribe();
    }

    if (this.booknameSubscription) {
      this.booknameSubscription.unsubscribe();
    }

    if (this.bookSubscription) {
      this.bookSubscription.unsubscribe();
    }

    if (this.clickNavigationSubscription) {
      this.clickNavigationSubscription.unsubscribe();
    }
  }
}
