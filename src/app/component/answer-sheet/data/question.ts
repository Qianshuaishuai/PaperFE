import { SubQuestion } from './subQuestion';

export class Question {
  title: string;
  isFirstPart: boolean;
  isMark: boolean;
  height: number;
  minHeight: number;
  subQuestions: SubQuestion[];
}
