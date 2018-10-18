import { Question, PaperQuestionSetChapter } from '../component/details/paper-details/data/paperDetailsResponse';

export class ChangeScore {
    question: Question;
    chapter: PaperQuestionSetChapter;
    index: number;
    subIndex: number;
    isBatchChange: boolean;
}
