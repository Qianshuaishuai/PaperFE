export class SaveEdit {
  name: string;
  detail: string;
  courseId: number;
  type: number;
  setscore: Setscore[];
}

export class Setscore {
  questionId: number;
  nScore: number;
}
