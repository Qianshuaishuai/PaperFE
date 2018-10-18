import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countToArray'
})
export class CountToArrayPipe implements PipeTransform {

  transform(gridCount: any, delta?: any): any {
    const array = [];
    for (let i = 0; i !== gridCount; i++) {
      array.push(i + 1 + delta);
    }
    return array;
  }

}
