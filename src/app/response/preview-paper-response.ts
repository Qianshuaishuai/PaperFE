import { Question, PaperQuestionSetChapter } from '../component/details/paper-details/data/paperDetailsResponse';

export interface PreviewPaperResponse {
    F_responseNo: number;
    F_responseMsg: string;
    F_data: PaperQuestionSetChapter[];
}

export class PreviewPaperQuestionSetChapter {
    type: number;
    name: string;
    questionCount: number;
    questions: string;
    isWithResource: boolean;    
    questionsContent: Question[];
}
