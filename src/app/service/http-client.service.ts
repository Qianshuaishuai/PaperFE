import { Injectable } from '@angular/core';
import { BASE_URL, BASE_URL_BEIKE } from '../constants';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoaderService } from './loader.service';
import { catchError, tap, finalize } from 'rxjs/operators';
import { PropertyService } from './property.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class HttpClientService {  

  private teacherId: string;
  private accessToken: string;
  apiSign: any;

  constructor(
    private httpClient: HttpClient,
    private loaderService: LoaderService,
    private propertyService: PropertyService,
  ) { }

  /**
   * get 请求
   *
   * @param url 请求接口 url
   * @param isHideLoader 是否隐藏加载进度条
   * @param type 调用 base url 类型
   * @param options 参数
   */
  get<T>(url: string, isHideLoader: boolean, type: number, options?: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    this.showLoader();
    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    options.params = options.params.set('F_teacher_id', this.teacherId).set('F_accesstoken', this.accessToken);

    // 参数签名
    const sign = this.sign(this.getParamsObj(options.params));
    options.params = options.params.set('F_sign', sign);

    return this.httpClient.get<T>(this.getFullUrl(url, type), options)
      .pipe(
        catchError(this.onCatch),
        tap((res: T) => {
          this.onSuccess<T>(res);
        }, (error: any) => {
          this.onError(error);
        }),
        finalize(() => {
          if (isHideLoader) {
            this.onEnd();
          }
        }));

  }

  /**
   * get 请求
   *
   * @param url 请求接口 url
   * @param type 调用 base url 类型
   * @param options 参数
   */
  getRequest<T>(url: string, type: number, options?: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    options.params = options.params.set('F_teacher_id', this.teacherId).set('F_accesstoken', this.accessToken);

    // 参数签名
    const sign = this.sign(this.getParamsObj(options.params));
    options.params = options.params.set('F_sign', sign);

    return this.httpClient.get<T>(this.getFullUrl(url, type), options)
      .pipe(
        catchError(this.onCatch),
        tap((res: T) => {
          this.onSuccess<T>(res);
        }, (error: any) => {
          this.onError(error);
        }),
        finalize(() => {
        }));
  }

  post<T>(url: string, body: any | null, type: number, params?: HttpParams): Observable<T> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded');

    this.teacherId = this.propertyService.readTeacherId();
    this.accessToken = this.propertyService.readAccesstoken();
    params = params.set('F_teacher_id', this.teacherId).set('F_accesstoken', this.accessToken);

    // 参数签名
    const sign = this.sign(this.getParamsObj(params));
    params = params.set('F_sign', sign);

    return this.httpClient.post<T>(this.getFullUrl(url, type), body, {
      params: params,
      headers: headers,
    });
  }



  /**
   * 获取完整 url
   *
   * @param url 请求接口 url
   * @param type 表示不同 API 0 表示 BASE_URL; 1 表示 BASE_URL_BEIKE
   */
  private getFullUrl(url: string, type: number): string {
    if (type === 0) {
      return BASE_URL + url;
    } else if (type === 1) {
      return BASE_URL_BEIKE + url;
    }
  }

  private onCatch(error: any, caught: Observable<any>): Observable<any> {
    return Observable.throw(error);
  }

  private onSuccess<T>(response: T): void {
    // console.log('Request successful');
  }

  private onError(res: Response): void {
    console.log('Error, status code: ' + res.status);
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }

  private sign(paramsObj): any {
    const apiSign = {
      wordMap: {
        '*': '%2A',
        '(': '%28',
        ')': '%29'
      },
      stdUrlsafe: {
        '+': '-',
        '/': '_'
      },
      encode(str) {
        return encodeURIComponent(str).replace(/[*()]/g, (v) => {
          return this.wordMap[v] || v;
        });
      },
      sign(params) {
        const keys = Object.keys(params);
        if (keys.length === 0) {
          console.error('params empty');
          return '';
        }
        if (!params.F_accesstoken) {
          console.error('F_accesstoken empty');
          return '';
        }
        keys.sort();
        const encryptStr = keys.map(v => {
          return [this.encode(v), '=', this.encode(params[v])].join('');
        }).join('&');
        return '01' + CryptoJS.HmacSHA1(encryptStr, params.F_accesstoken)
              .toString(CryptoJS.enc.Base64).replace(/[+/]/g, (v) => {
          return this.stdUrlsafe[v] || v;
        });
      }
    };
    return apiSign.sign(paramsObj);
  }

  private getParamsObj(params): Object {
    const paramsObj = new Object;
    params['updates'].forEach((v) => {
      if (v['value']) {
        const key = v['param'];
        const value = v['value'];
        paramsObj[key] = value;
      }
    });
    return paramsObj;
  }

}
