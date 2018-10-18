import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HttpClientService } from '../../../service/http-client.service';

import { PreviewPaperResponse } from '../../../response/preview-paper-response';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClientService: HttpClientService) { }

  /**
   * 获取从组卷进入答题卡页面 数据
   *
   * @param teacherId 当前老师登录的账号 id
   * @param courseId 这个试题蓝属于哪个课程
   * @param answerSheetFlag 是否为答题卡入口获取
   * @param resourceId 要获取的试卷id
   */
  getPaperListBasketData(teacherId: string, courseId: number, answerSheetFlag?: boolean,
    resourceId?: number): Observable<PreviewPaperResponse> {
    const params = new HttpParams()
      .set('F_course_id', String(courseId))
      .set('F_answer_sheet_flag', String(answerSheetFlag))
      .set('F_resource_id', String(resourceId));

    return this.httpClientService.get<PreviewPaperResponse>('v1/questionbasket/data', true, 0, { params: params });
  }

  /**
   * 保存答题卡数据
   * @param teacherId 当前老师登录的账号 id
   * @param accessToken 就是ACCESSTOKEN
   * @param resourceId 保存答题卡对应组卷id
   * @param jsonData 保存答题卡数据
   */
  saveAnswerSheetData(teacherId: string, accessToken: string, resourceId: string,
    jsonData: string): Observable<{ F_responseNo: number, F_responseMsg: string }> {
    const params = new HttpParams()
      .set('F_resource_id', resourceId);
    return this.httpClientService.post<{ F_responseNo: number, F_responseMsg: string }>(
      'v1/answersheet/set', jsonData, 0, params
    );
  }

  /**
   * 获取答题卡数据
   * @param teacherId 当前老师登录的账号 id
   * @param accessToken 就是ACCESSTOKEN
   * @param resourceId 保存答题卡对应组卷id
   */
  getAnswerSheetData(
    teacherId: string,
    accessToken: string,
    resourceId: string
  ): Observable<{ F_responseNo: number, F_responseMsg?: string, F_data?: any }> {
    const params = new HttpParams()
      .set('F_resource_id', resourceId);
    return this.httpClientService.get<{ F_responseNo: number, F_responseMsg?: string, F_data?: any }>(
      'v1/answersheet/get', true, 0, { params: params }
    );
  }
}
