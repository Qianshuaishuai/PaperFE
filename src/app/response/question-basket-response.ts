import { Question } from '../component/details/paper-details/data/paperDetailsResponse';

export interface QuestionBasketResponse {
    F_responseNo: number;
    F_responseMsg: string;
    F_data: QuestionsBasket[];
}

export class QuestionsBasket {
    type: number;
    name: string;
    questionCount: number;
    questions: string;
}
