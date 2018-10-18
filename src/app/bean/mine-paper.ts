import { Question } from '../component/details/paper-details/data/paperDetailsResponse';

export class MinePaper {
    F_teachter_id: string;
    F_paper_data: PaperData;
}

export class PaperData {
    name: string;
    detail: string;
    fullScore: number;
    type: number;
    semesterId: number;
    courseId: number;
    paperQuestionSetChapters: PaperQuestionSetChapter[];
}
export class PaperQuestionSetChapter {
    name: string;
    desc: string;
    questionCount: number;
    presetScore: number;
    questionContent: Question[];
}
