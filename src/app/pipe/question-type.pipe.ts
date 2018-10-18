import { Pipe, PipeTransform } from '@angular/core';
import { SINGLE_CHOICE, MULTIPLE_CHOICE, INDEFINITE_CHOICE,
  JUDGMENT, OBJECTIVE_FILL, SUBJECTIVE_FILL, QUESTION_ANSWER, SORT, CONNECTION, CLOZE, QUIZ, MATERIAL_SINGLE_CHOICE,
  MATERIAL_MULTIPLE_CHOICE, MATERIAL_JUDGMENT, MATERIAL_INDEFINITE_CHOICE, MATERIAL_OBJECTIVE_FILL,
  SEVEN_SELECT_FIVE } from '../constants';

@Pipe({
  name: 'questionType'
})
export class QuestionTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch (value) {
      case SINGLE_CHOICE:
        return '单选题';

      case MULTIPLE_CHOICE:
        return '多选题';

      case INDEFINITE_CHOICE:
        return '不定项选择题';

      case JUDGMENT:
        return '判断题';

      case OBJECTIVE_FILL:
        return '客观填空题';

      case SUBJECTIVE_FILL:
        return '主观填空题';

      case QUESTION_ANSWER:
        return '问答题';

      case SORT:
        return '排序题';

      case CONNECTION:
        return '连线题';

      case MATERIAL_SINGLE_CHOICE:
      case MATERIAL_MULTIPLE_CHOICE:
      case MATERIAL_INDEFINITE_CHOICE:
      case MATERIAL_JUDGMENT:
      case MATERIAL_OBJECTIVE_FILL:
      case MATERIAL_SINGLE_CHOICE:
        return '材料题';

      case QUIZ:
        return '图文问答题';

      case CLOZE:
        return '完型填空';

      case SEVEN_SELECT_FIVE:
        return '七选五';

      default:
        return '';
    }
  }

}
