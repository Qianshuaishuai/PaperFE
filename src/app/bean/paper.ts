export class Paper {
    id: number;
    name: string;
    type: number;
    typeName: string;
    difficulty: number;
    difficultyString: string;
    date: string;
    courseId: number;
    semesterId: number;
    referenceCount: number;
    isQuote = false;
    isShowDeleteBtn = false;
}
