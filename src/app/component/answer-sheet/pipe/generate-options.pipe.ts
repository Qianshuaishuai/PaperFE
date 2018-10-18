import { Pipe, PipeTransform } from '@angular/core';
import { MarkSubQuestion } from '../data/markSubQuestion';

@Pipe({
  name: 'generateOptions'
})
export class GenerateOptionsPipe implements PipeTransform {

  private selectOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  transform(markSubQuestion: MarkSubQuestion, args?: any): any {
    switch (markSubQuestion.type) {
      case 10001:
      case 10002:
      case 10003:
        return this.selectOptions.slice(0, markSubQuestion.optionCounts);
      case 10004:
        return  markSubQuestion.style ? ['T', 'F'] : ['√', 'X'];
    }
  }
}
