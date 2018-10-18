import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';

import { HttpClientService } from './http-client.service';

import { PaperListResponse } from '../response/paper-list-response';
import { PaperDetailsResponse } from '../component/details/paper-details/data/paperDetailsResponse';
import { Response } from '../response/response';
import { CoursewareResponse } from '../response/courseware-response';
import { CorrectAddResponse } from '../response/correct-add-response';
import { SearchResponse } from '../response/search-response';
import { QuestionBasketResponse } from '../response/question-basket-response';
import { PreviewPaperResponse } from '../response/preview-paper-response';
import { KeyPointResponse } from '../response/keypoint-response';

@Injectable()
export class PaperService {

  constructor(
    private httpClientService: HttpClientService
  ) { }

  /**
   * 根据课程 id 获取试卷列表
   *
   * @param courseId 课程 id（必须传入）
   * @param perPageCount 查询的每页的数量（默认 10）
   * @param page 查询第几页
   * @param sortFlag 排序,默认按时间降序(０降序,１升序)
   *
   * @return 返回试卷列表
   */
  // tslint:disable-next-line:max-line-length
  getPaperList(courseId: number, gradeId: number, provinceId: number, paperTypeId: number, perPageCount: number, page: number,
    sortFlag: number, isHideLoader: boolean): Observable<PaperListResponse> {
    const params = new HttpParams()
      .set('F_course_id', String(courseId))
      .set('F_grade_id', String(gradeId))
      .set('F_province_id', String(provinceId))
      .set('F_paper_type_id', String(paperTypeId))
      .set('F_perPageCount', String(perPageCount))
      .set('F_page', String(page))
      .set('F_sortFlag', String(sortFlag));

    return this.httpClientService.get<PaperListResponse>('v1/paper/list', isHideLoader, 0, { params: params });
  }

  // tslint:disable-next-line:one-line
  getPaperInfo(paperId: number, isHideLoader: boolean): Observable<PaperDetailsResponse> {
    const params = new HttpParams()
      .set('F_resource_id', String(paperId));

    return this.httpClientService.get<PaperDetailsResponse>('v1/paper/infopaper', isHideLoader, 0, { params: params });
  }

  quote(teacherId: string, accesstoken: string, periodId: string, moment: string, resourceIds: string) {
    const params = new HttpParams()
      .set('F_period_id', periodId)
      .set('F_moment', moment)
      .set('F_resource_ids', resourceIds);

    return this.httpClientService.post<Response>('v1/paper/resource', null, 0, params);
  }

  cancelQuote(accesstoken: string, moment: string, periodId: string, resourceIds: string, teacherId: string) {
    const params = new HttpParams()
      .set('F_moment', moment)
      .set('F_period_id', periodId)
      .set('F_resource_ids', resourceIds);

    // const headers = new HttpHeaders()
    //     .append('Content-Type', 'application/x-www-form-urlencoded');
    return this.httpClientService.getRequest<Response>('v1/period/deleteResource', 1, { params: params });
  }

  getCoursewareList(accesstoken: string, moment: string, periodId: string, teacherId: string) {
    const params = new HttpParams()
      .set('F_moment', moment)
      .set('F_period_id', periodId);

    return this.httpClientService.getRequest<CoursewareResponse>('v1/period/coursewareList', 1, { params: params });
  }

  searchPaper(query: string, courseId: number, gradeId: number, provinceId: number, paperTypeId: number, perPageCount: number,
    page: number, sortFlag: number, isHideLoader: boolean) {
    const params = new HttpParams()
      .set('F_query', query)
      .set('F_course_id', String(courseId))
      .set('F_grade_id', String(gradeId))
      .set('F_province_id', String(provinceId))
      .set('F_paper_type_id', String(paperTypeId))
      .set('F_perPageCount', String(perPageCount))
      .set('F_page', String(page))
      .set('F_sortFlag', String(sortFlag));

    return this.httpClientService.get<SearchResponse>('v1/paper/search', isHideLoader, 0, { params: params });
  }

  /**
   * 更新试题篮
   *
   * @param teacherId 当前教师账号 id
   * @param json 更新数据
   */
  updateQuestionBasket(teacherId: string, courseId: number, json: string) {
    const params = new HttpParams()
      .set('F_course_id', String(courseId));

    return this.httpClientService.post<QuestionBasketResponse>('v1/questionbasket/set', json, 0, params);
  }

  /**
   * 试卷详情获取被选题型
   *
   * @param teacherId 当前老师登录的账号 id
   */
  getQuestionBasket(teacherId: string, courseId: number): Observable<QuestionBasketResponse> {
    const params = new HttpParams()
      .set('F_course_id', String(courseId));

    return this.httpClientService.getRequest<QuestionBasketResponse>('v1/questionbasket/get', 0, { params: params });
  }

  /**
   * 预览试卷获取被选题目
   *
   * @param teacherId 当前老师登录的账号 id
   * @param courseId 这个试题蓝属于哪个课程
   */
  getSelectedQuestionContent(teacherId: string, courseId: number): Observable<PreviewPaperResponse> {
    const params = new HttpParams()
      .set('F_course_id', String(courseId));

    return this.httpClientService.get<PreviewPaperResponse>('v1/questionbasket/data', true, 0, { params: params });
  }

  /**
   * 获取我的试卷列表
   *
   * @param teacherId
   * @param accesstoken
   * @param courseId
   * @param gradeId
   * @param paperTypeId
   * @param perPageCount
   * @param page
   * @param sortFlag
   * @param isHideLoader
   */
  getMinePaperList(teacherId: string, accesstoken: string, courseId: number, gradeId: number, paperTypeId: number,
    perPageCount: number, page: number, sortFlag: number, isHideLoader: boolean): Observable<PaperListResponse> {
    const params = new HttpParams()
      .set('F_course_id', String(courseId))
      .set('F_grade_id', String(gradeId))
      .set('F_paper_type_id', String(paperTypeId))
      .set('F_perPageCount	', String(perPageCount))
      .set('F_page', String(page))
      .set('F_sortFlag', String(sortFlag));

    return this.httpClientService.get<PaperListResponse>('v1/suitpaper/list', isHideLoader, 0, { params: params });
  }

  /**
   * 删除我的试卷
   *
   * @param teacherId
   * @param accesstoken
   * @param resourceId
   */
  deleteMinePaper(teacherId: string, accesstoken: string, resourceId: number) {
    const params = new HttpParams()
      .set('F_resource_id', String(resourceId));

    return this.httpClientService.getRequest<Response>('v1/suitpaper/delete', 0, { params: params });
  }

 /**
   * 提交题目纠错
   * @param teacherId             电子书包教师id
   * @param accessToken           同教师id一起传进的校验码
   * @param questionId            要纠错的题目id
   * @param paperId               该问题对应的试卷id
   * @param incorrectType         纠错类型
   * @param incorrectDetail       纠错描述
   */
  correctingAdd(teacherId: string, accessToken: string, questionId: number,
    paperId: number, incorrectType: number, incorrectDetail: string): Observable<CorrectAddResponse> {
    const params = new HttpParams()
    .set('F_question_id', String(questionId))
    .set('F_paper_id', String(paperId))
    .set('F_incorrect_type', String(incorrectType))
    .set('F_incorrect_detail', incorrectDetail);

    return this.httpClientService.getRequest<CorrectAddResponse>('v1/correcting/add', 0, { params: params });
  }

  /**
   * 获取同步试卷列表
   *
   * @param {number} courseId 课程 id（必须传入）
   * @param {number} bookId 教材 id (必须传入)
   * @param {number} perPageCount 查询的每页的数量（默认 10）
   * @param {number} page 查询第几页
   *
   * @return 返回同步试卷列表
   */
  // tslint:disable-next-line:max-line-length
  getSyncPaperList(courseId: number, bookId: number, paperTypeId: number, perPageCount: number, page: number, isHideLoader: boolean): Observable<PaperListResponse> {
    const params = new HttpParams()
      .set('F_course_id', String(courseId))
      .set('F_book_id', String(bookId))
      .set('F_paper_type_id', String(paperTypeId))
      .set('F_perPageCount', String(perPageCount))
      .set('F_page', String(page));

    return this.httpClientService.get<PaperListResponse>('v1/syncpaper/list', isHideLoader, 0, { params: params });
  }

  /**
   * 获取 同步试卷 详细信息
   *
   * @param {number} paperId
   */
  getSyncPaperInfo(paperId: number, isHideLoader: boolean): Observable<PaperDetailsResponse> {
    const params = new HttpParams()
      .set('F_resource_id', String(paperId));

    return this.httpClientService.get<PaperDetailsResponse>('v1/syncpaper/infopaper', isHideLoader, 0, { params: params });
  }

  /**
   * 引用 同步试卷
   */
  quoteSyncPaper(teacherId: string, accesstoken: string, periodId: string, moment: string, resourceIds: string) {
    const params = new HttpParams()
      .set('F_period_id', periodId)
      .set('F_moment', moment)
      .set('F_resource_ids', resourceIds);

    return this.httpClientService.post<Response>('v1/syncpaper/resource', null, 0, params);
  }

  /**
   * 获取知识点 (从备课本API获取)
   * @param teacherId     老师ID
   * @param accesstoken   老师ACCESSTOKEN
   * @param stageId       学段ID (可选)
   * @param bookId        教材ID(如果传了这个值,会根据这个值判断学段) (可选)
   * @param subjectId     科目ID(1-11)
   * @param special       如果传了这个参数且值为"1",则F_teacher_id与F_accesstoken不用传 (可选)
   */
  getKeyPoints(teacherId: string, accesstoken: string, subjectId: number,
    isHideLoader: boolean, stageId?: string, bookId?: number, special?: string) {
    const params = new HttpParams()
      .set('F_stage_id', stageId)
      .set('F_book_id', String(bookId))
      .set('F_subject_id', String(subjectId));

    return this.httpClientService.get<KeyPointResponse>('v1/keypoint/list', isHideLoader, 1, { params: params });
  }
}
