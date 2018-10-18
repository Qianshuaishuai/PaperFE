import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpClientService } from './http-client.service';
import { StageResponse, SubjectResponse, BookenameResponse, BookResponse, ChapterResponse } from '../response/switch-response';
import { Observable } from 'rxjs';
import { TokenResponse } from '../response/token-response';
import { Response } from '../response/response';
import { SavePaperResponse } from '../response/save-paper-response';

@Injectable()
export class SwitchBookService {

  constructor(
    private httpClientService: HttpClientService
  ) { }

  getStageList(teacherId: string, accesstoken: string): Observable<StageResponse> {
    const params = new HttpParams();

    return this.httpClientService.getRequest<StageResponse>('v1/prepareBook/stageList', 1, { params: params });
  }

  getSubjectList(accesstoken: string, teacherId: string, stageId: string): Observable<SubjectResponse> {
    const params = new HttpParams()
      .set('F_stage_id', String(stageId));

    return this.httpClientService.getRequest<StageResponse>('v1/prepareBook/subjectList', 1, { params: params });
  }

  getBookenameList(accesstoken: string, teacherId: string, stageId: string, subjectId: number): Observable<BookenameResponse> {
    const params = new HttpParams()
      .set('F_stage_id', String(stageId))
      .set('F_subject_id', String(subjectId));

    return this.httpClientService.getRequest<StageResponse>('v1/prepareBook/bookenameList', 1, { params: params });
  }

  getBookList(accesstoken: string, teacherId: string, stageId: string, subjectId: number, bookename: string): Observable<BookResponse> {
    const params = new HttpParams()
      .set('F_stage_id', String(stageId))
      .set('F_subject_id', String(subjectId))
      .set('F_book_ename', String(bookename));

    return this.httpClientService.getRequest<BookResponse>('v1/prepareBook/bookList', 1, { params: params });
  }

  getChapterList(accesstoken: string, teacherId: string, bookId: number, termFlag?: string): Observable<ChapterResponse> {
    const params = new HttpParams()
      .set('F_book_id', String(bookId));

    return this.httpClientService.getRequest<ChapterResponse>('v1/teacherBook/chapterList', 1, { params: params });
  }

  /**
   * 获取保存凭证
   *
   * @param teacherId
   * @param accesstoken
   */
  getSaveToken(teacherId: string, accesstoken: string): Observable<TokenResponse> {
    const params = new HttpParams();

    return this.httpClientService.getRequest<TokenResponse>('v1/token', 0, { params: params });
  }

  /**
   * 保存试卷
   *
   * @param teacherId
   * @param accesstoken
   * @param savetoken
   * @param jsonData
   */
  savePaper(teacherId: string, accesstoken: string, savetoken: string, jsonData: string) {
    const params = new HttpParams()
      .set('F_save_token', savetoken);

    return this.httpClientService.post<SavePaperResponse>('v1/suitpaper/add', jsonData, 0, params);
  }

  /**
   * 保存修改分数
   *
   * @param teacherId
   * @param accesstoken
   * @param jsonData
   */
  setScore(teacherId: string, accesstoken: string, jsonData: string) {
    const params = new HttpParams();

    return this.httpClientService.post<Response>('v1/suitpaper/setscore', jsonData, 0, params);
  }

  /**
   * 保存大题题型
   *
   * @param teacherId
   * @param accesstoken
   * @param jsonData
   */
  setEditQuestion(teacherId: string, accesstoken: string, jsonData: string) {
    const params = new HttpParams();

    return this.httpClientService.post<Response>('v1/suitpaper/edit', jsonData, 0, params);
  }
}
