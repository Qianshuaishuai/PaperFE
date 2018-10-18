import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paperType'
})
export class PaperTypePipe implements PipeTransform {

  transform(value: number, args?: any): any {
    switch (value) {
      case 1:
        return '真题';
      case 2:
        return '模拟题';
    }
  }
}
