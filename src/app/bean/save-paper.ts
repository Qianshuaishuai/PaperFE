import { PaperQuestionSetChapter } from '../component/details/paper-details/data/paperDetailsResponse';

export class SavePaper {
    F_data: Paper;
    F_score_data: Score[];
}

export class Paper {
    name: string;
    comment: string;
    type: number;
    fullScore: number;
    gradeId: number;
    courseId: number;
    bookId: number;
    chapterId: number;
    questionSet: QuestionSet;
    structures: Structure[];
}

export class QuestionSet {
    questionIds: string;
    paperQuestionSetChapters: PaperQuestionSetChapter[];
}

export class Score {
    questionId: number;
    nScore: number;
}

export class Structure {
  id: number;
  detail: string;
  isChose: boolean;
}
