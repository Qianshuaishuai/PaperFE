import { Accessory, SolutuonAccessory, KeyPoint, Question } from '../../details/paper-details/data/paperDetailsResponse';

export class QuestionType {
  id: number;
  name: string;
}

export class Difficulty {
  value: number;
  name: string;
}

export class NewQuestion {
    id = 0;
    type = 10001;
    subject: number;
    content = '';
    solution = '';
    accessories: Accessory[] = []; // options 放在 accessories
    solutionAccessories: SolutuonAccessory[] = [];
    v = 1;
    difficulty = 8;
    source = '';
    score = 0;
    keypoints: KeyPoint[] = [];
    phase: number;
    options = ['', '', ''];
    answer = '';
    questions: Question[];
    isJoinQuestionBasket = false;
    number: number;
    courseId: number;
    newType: number;
    blank = 0;
}

export const questionTypes = [
  {
    id: 10001,
    name: '单选题'
  },
  {
    id: 10002,
    name: '多选题'
  },
  {
    id: 10003,
    name: '不定项选择题'
  },
  {
    id: 10004,
    name: '判断题'
  },
  {
    id: 10005,
    name: '客观填空题'
  },
  {
    id: 10006,
    name: '主观填空题'
  },
  {
    id: 10007,
    name: '问答题'
  }
];

export const difficulties = [
  {
    value: 8,
    name: '简单'
  },
  {
    value: 6,
    name: '较易'
  },
  {
    value: 4.5,
    name: '一般'
  },
  {
    value: 3,
    name: '较难'
  },
  {
    value: 2,
    name: '困难'
  }
];
