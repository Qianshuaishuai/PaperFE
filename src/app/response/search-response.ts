import { Paper } from './../bean/paper';
export class SearchResponse {
  F_responseNo: number;
  F_responseMsg: string;
  F_totalPage: number;
  F_currentPage: number;
  F_pageIsEnd: number;
  F_list: Paper[];
  F_hightlight: object;
  F_hightlight_paper_id: number;
}
