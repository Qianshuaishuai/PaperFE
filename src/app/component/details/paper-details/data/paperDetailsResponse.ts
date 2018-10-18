export class PaperDetailsResponse {
    F_responseNo: number;
    F_responseMsg: string;
    F_info: Info;
}

// tslint:disable-next-line:class-name
export class Info {
    F_resource_id: number;
    F_title: string;
    F_type_detail: number;
    F_courseware_url: string;
    F_data: F_data;
}

// tslint:disable-next-line:class-name
export class F_data {
    id: number;
    name: string;
    shortName: string;
    type: number;
    typeName: string;
    subjectName: string;
    date: string;
    difficulty: number;
    courseId: number;
    semesterId: number;
    fullScore: number;
    provinces: Province[];
    questionSet: QuestionSet;
    referenceCount: number;
    phase: number;
}

export class QuestionSet {
    id: number;
    paperId: number;
    paperName: string;
    timeToAccimplish: number;
    questionIds: string;
    paperQuestionSetChapters: PaperQuestionSetChapter[];
}

export class PaperQuestionSetChapter {
    type: number;
    name: string;
    detail: string;
    questions: string;
    desc: string;
    questionCount: number;
    time: number;
    presetScore: number;
    setId: number;
    questionsContent: Question[];
    isWithResource: boolean;
    phase: number;
    courseId: number;
}

export class Question {
    id: number;
    type: number;
    subject: number;
    content: string;
    solution: string;
    accessories: Accessory[];
    solutionAccessories: SolutuonAccessory[];
    v: number;
    difficulty: number;
    source: string;
    score: number;
    keypoints: KeyPoint[];
    phase: number;
    options: string[];
    answer: any;
    questions: Question[];
    isJoinQuestionBasket = false;
    number: number;
    courseId: number;
    newType: number;
    blank: number;
}

export class Accessory {
    type: number;
    label: string;
    content: string;
}

export class SolutuonAccessory {
    type: number;
    label: string;
    content: string;
}

export class KeyPoint {
    id: number;
    name: string;
    type: number;
}

export class Province {
    id: number;
    name: string;
}
