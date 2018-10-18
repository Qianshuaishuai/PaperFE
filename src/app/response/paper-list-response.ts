import { Paper } from '../bean/paper';

export interface PaperListResponse {
    F_currentPage: number;
    F_list: Paper[];
    F_pageIsEnd: number;
    F_responseMsg: string;
    F_responseNo: number;
    F_totalPage: number;
}
