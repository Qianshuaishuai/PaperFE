import { Question } from '../component/details/paper-details/data/paperDetailsResponse';

export class QuestionBasket {
    question: Question;
    mark: number; // 1 表示加入试题篮 2 表示移出试题篮
    isJoinAll: boolean;
}
