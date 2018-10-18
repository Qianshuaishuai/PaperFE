import { Pipe, PipeTransform } from '@angular/core';
import {
  JUNIOR_CHINESE, JUNIOR_MATH, JUNIOR_ENGLISTH, JUNIOR_PHYSICY, JUNIOR_BIOLOGY, JUNIOR_CHEMISTRY,
  JUNIOR, JUNIOR_HISTORY, JUNIOR_GEOGRAPHY, JUNIOR_POLITICS, SENIOR_CHINESE, SENIOR_MATH, SENIOR_ENGLISTH,
  SENIOR_PHYSICY, SENIOR_CHEMISTRY, SENIOR_BIOLOGY, SENIOR_HISTORY, SENIOR_GEOGRAPHY, SENIOR_POLITICS,
  PRIMARY_CHINESE, PRIMARY_MATH, PRIMARY_ENGLISH
} from '../constants';

@Pipe({
  name: 'switchSubject'
})
export class SwitchSubjectPipe implements PipeTransform {

  transform(value: any, args?: any): string {
    switch (value) {
      case PRIMARY_CHINESE:
      case JUNIOR_CHINESE:
      case SENIOR_CHINESE:
        return '语文';

      case PRIMARY_MATH:
      case JUNIOR_MATH:
      case SENIOR_MATH:
        return '数学';

      case PRIMARY_ENGLISH:
      case JUNIOR_ENGLISTH:
      case SENIOR_ENGLISTH:
        return '英语';

      case JUNIOR_PHYSICY:
      case SENIOR_PHYSICY:
        return '物理';

      case JUNIOR_CHEMISTRY:
      case SENIOR_CHEMISTRY:
        return '化学';

      case JUNIOR_BIOLOGY:
      case SENIOR_BIOLOGY:
        return '生物';

      case JUNIOR_HISTORY:
      case SENIOR_HISTORY:
        return '历史';

      case JUNIOR_GEOGRAPHY:
      case SENIOR_GEOGRAPHY:
        return '地理';

      case JUNIOR_POLITICS:
        return '思想品德';

      case SENIOR_POLITICS:
        return '政治';

      default:
        return '';
    }
  }
}
