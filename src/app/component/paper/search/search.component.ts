import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SearchModel } from '../../../bean/search-model';
import { PropertyService } from '../../../service/property.service';
import { DEFAULT_GRADE_ID } from '../../../constants';
// import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  isSearchModel = false;
  paddingLeft = 10;
  // width = 240;

  courseId = 1;
  gradeId = DEFAULT_GRADE_ID;
  provinceId = 1;
  paperTypeId = -1;

  // 1 表示套卷 2 表示试卷 3 表示同步试卷
  isClickMinePaper = 1;

  paramsSubscription: Subscription;
  isClickMinePaperSubscription: Subscription;

  keyword: string;

  constructor(
    private messageService: MessageService,
    private propertyService: PropertyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.paramsSubscription = this.messageService.getParams().subscribe(data => {
      this.courseId = +data[0];
      this.gradeId = +data[1];
      this.provinceId = +data[2];
      this.paperTypeId = +data[3];

      if (this.provinceId === 0) {
        this.isClickMinePaper = 3;
      }

      // 主要为了区别省份这个过滤条件，目前我的试卷没有这个条件
      // if (+data[4] === 0) {
      //   this.propertyService.writeProvinceId(+data[2]);
      // }
      this.propertyService.writeSubjectId(this.courseId);
      this.propertyService.writeGradeId(this.gradeId);
      // this.propertyService.writePaperTypeId(this.paperTypeId);
    }, error => console.log('Search get router params fail: ' + error));

    this.isClickMinePaperSubscription = this.messageService.getclickNavigationObservable().subscribe(isClickMinePaper => {
      this.isClickMinePaper = isClickMinePaper;

      if (this.isSearchModel) {
        this.exitSearch();
      }
    });
  }

  exitSearch() {
    this.isSearchModel = false;
    this.keyword = '';
    const searchModel = new SearchModel();
    searchModel.keyword = this.keyword;
    searchModel.searchModel = this.isSearchModel;
    this.messageService.exitSearchModel(searchModel);
    this.router.navigate(['/library', this.courseId, this.gradeId, this.provinceId, this.paperTypeId, 0]);
  }

  search() {
    if (this.keyword === undefined || this.keyword.trim().length > 30) {
      return;
    }
    this.isSearchModel = true;

    const searchModel = new SearchModel();
    searchModel.keyword = this.keyword;
    searchModel.searchModel = this.isSearchModel;

    this.messageService.enterSearchModel(searchModel);
    this.router.navigate(['/library', this.keyword, this.courseId, this.gradeId, this.provinceId, this.paperTypeId, 0]);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.paramsSubscription !== undefined) {
      this.paramsSubscription.unsubscribe();
    }
  }
}
