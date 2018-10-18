import { Pipe, PipeTransform } from '@angular/core';
import { JUNIOR_SCHOOL, SENIOR_SCHOOL, PRIMARY_SCHOOL } from '../constants';

@Pipe({
  name: 'grade'
})
export class GradePipe implements PipeTransform {

  transform(value: any, args?: any): string {
    switch (value) {
      case JUNIOR_SCHOOL:
        return '初中';

      case SENIOR_SCHOOL:
        return '高中';

      case PRIMARY_SCHOOL:
        return '小学';

      default:
        return;
    }
  }

}
