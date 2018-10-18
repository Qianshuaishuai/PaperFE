import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeToType'
})
export class TypeToTypePipe implements PipeTransform {

  transform(type: any, args?: any): any {
    switch (type) {
      case 10001:
      case 10002:
      case 10003:
      case 10004:
        return 'mark';
      case 10005:
      case 10006:
        return 'fillIn';
      case 0:
        return 'chineseComposition';
      case 1:
        return 'englishComposition';
      default:
        return 'answer';
    }
  }

}
