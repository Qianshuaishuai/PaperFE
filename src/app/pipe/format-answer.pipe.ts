import { Pipe, PipeTransform } from '@angular/core';
import { SINGLE_CHOICE, MULTIPLE_CHOICE, OPTIONS, JUDGMENT } from '../../app/constants';
import { Utils } from '../../app/utils';
import * as _ from 'lodash';

@Pipe({
  name: 'formatAnswer'
})
export class FormatAnswerPipe implements PipeTransform {
  // this.answer => return value

  constructor(
    private utils: Utils,
  ) { }

  transform(answer: any, type?: any): any {
    let value = '';
    if (type === SINGLE_CHOICE || type === MULTIPLE_CHOICE || type === 10003) {
      if (typeof answer === 'string') {
        return OPTIONS[answer];
      } else {
        answer.forEach((item, index) => {
          value += OPTIONS[item] + '；';
        });
        return value = value.substring(0, value.length - 1);
      }
    } else if (type === JUDGMENT) {
      if (+answer === 0) {
        value = '正确';
      } else {
        value = '错误';
      }
      return value;
    } else {
      if (!answer) {
        if (Array.isArray(answer)) {
          answer.forEach((item, index) => {
            value += this.utils.dealStr(item, false) + '；';
          });
          return value.substring(0, value.length - 1);
        } else {
          return this.utils.dealStr(answer, false);
        }
      } else {
        if (_.isArray(answer)) {
          answer = answer.map(v => this.utils.dealStr(v, false)).join('，');
          return answer;
        } else {
          return this.utils.dealStr(answer.toString(), false);
        }
      }
    }
  }
}
