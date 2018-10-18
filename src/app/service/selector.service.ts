import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';
import { CourseResponse } from '../response/course-response';
import { ProvinceResponse } from '../response/province-response';
import { GradeResponse } from '../response/grade-response';
import { PaperTypeResponse } from '../response/paper-type-response';
import { HttpClientService } from './http-client.service';
import { BooknameResponse } from '../response/bookname-response';
import { BookResponse } from '../response/book-response';

@Injectable()
export class SelectorService {

  constructor(
    private httpClientService: HttpClientService
  ) { }

  /**
   * 根据 phase 获取年级列表
   *
   * @param {number} phase 1 初中 2 高中
   * @return 返回年级列表
   */
  getGrades(phase: number, isSyncPaper: number): Observable<GradeResponse> {
    const params = new HttpParams()
      .set('F_phase', String(phase))
      .set('F_sync_paper', String(isSyncPaper));
    return this.httpClientService.getRequest<GradeResponse>('v1/paper/grades', 0, { params: params });
  }

  /**
   * 获取试卷类型
   *
   * @param {number} suitType 区分是真题试卷还是我的试卷 0 表示真题试卷 1 表示我的试卷
   * @param {number} phase 1 表示初中 2 表示高中 3 表示小学
   * @return 返回试卷类型列表
   */
  getTypes(suitType: number, phase: number): Observable<PaperTypeResponse> {
    const params = new HttpParams()
      .set('F_suit_paper', String(suitType))
      .set('F_phase', String(phase));
    return this.httpClientService.getRequest<PaperTypeResponse>('v1/papertypes', 0, { params: params });
  }

  /**
   * 获取省份列表
   *
   * @return 返回省份列表
   */
  getProvinces(): Observable<ProvinceResponse> {
    const params = new HttpParams();
    return this.httpClientService.getRequest<ProvinceResponse>('v1/paper/provinces', 0, {params: params});
  }

  /**
   * 获取获取列表
   *
   * @return 返回获取列表
   */
  getCourses(): Observable<CourseResponse> {
    const params = new HttpParams();
    return this.httpClientService.getRequest<CourseResponse>('v1/paper/courses', 0, {params: params});
  }

  /**
   * 同步试卷 获取教材版本
   *
   * @param {number} courseId 课程 id
   *
   * @return 返回教材版本列表
   */
  getBookNameList(courseId: number) {
    const params = new HttpParams()
      .set('F_course_id', String(courseId));

    return this.httpClientService.getRequest<BooknameResponse>('v1/syncpaper/booknameList', 0, {params});
  }

  /**
   * 同步试卷 获取教材
   *
   * @param {number} courseId 课程 id
   * @param {string} bookname 教材名称
   *
   * @return 返回教材列表
   */
  getBooks(courseId: number, bookname: string) {
    const params = new HttpParams()
      .set('F_course_id', String(courseId))
      .set('F_book_name', String(bookname));

    return this.httpClientService.getRequest<BookResponse>('v1/syncpaper/book', 0, {params});
  }
}
