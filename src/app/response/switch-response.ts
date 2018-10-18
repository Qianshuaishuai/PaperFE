import { Stage, Book, Chapter } from '../bean/switch';

export class StageResponse {
  F_responseNo: number;
  F_responseMsg: string;
  F_list: Stage[];
}

export class SubjectResponse {
  F_responseNo: number;
  F_responseMsg: string;
  F_list: any;
}

export class BookenameResponse {
  F_responseNo: number;
  F_responseMsg: string;
  F_list: any;
}

export class BookResponse {
  F_responseNo: number;
  F_responseMsg: string;
  F_list: Book[];
}

export class ChapterResponse {
  F_responseNo: number;
  F_responseMsg: string;
  F_last_section_id: number;
  F_last_period_id: string;
  F_list: Chapter[];
}
