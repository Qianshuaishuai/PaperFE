import { PaperType } from '../bean/paper-type';

export interface PaperTypeResponse {
    F_responseNo: number;
    F_responseMsg: string;
    F_paper_types: PaperType[];
}
