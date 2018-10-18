import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpClientService } from './http-client.service';
import { SetQuestionResponse } from '../response/response';

@Injectable({
  providedIn: 'root'
})
export class PreviewPaperService {

  constructor(
    private httpClientService: HttpClientService
  ) { }

  /**
   * 小题编辑接口
   * @param teacherId
   * @param accesstoken
   * @param jsonData
   */
  setSuitQuestion(teacherId: string, accesstoken: string, jsonData: string) {
    const params = new HttpParams();

    return this.httpClientService.post<SetQuestionResponse>('v1/suitpaper/setSuitQuestion', jsonData, 0, params);
  }

  /**
   * 材料题编辑接口
   * @param teacherId
   * @param accesstoken
   * @param jsonData
   */
  setSuitLargeQuestion(teacherId: string, accesstoken: string, jsonData: string) {
    const params = new HttpParams();

    return this.httpClientService.post<SetQuestionResponse>('v1/suitpaper/setSuitLargeQuestion', jsonData, 0, params);
  }
}
