import { Question } from './question';
export class AnswerSheet {
  // true表示准考证，false表示条形码
  candidateNumberType: boolean;
  capacity: number;
  isFirstPage: boolean;
  isDangerZone: boolean;
  isThreeCol: boolean;
  isLeftBorder: boolean;
  isRightBorder: boolean;
  isSetNoAnswerArea: boolean;
  mainWidth: number;
  mainLeft: number;
  pageIndex: number;
  noAnswerAreaHeight: number;
  questions: Question[];
}
