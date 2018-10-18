import { Courseware } from '../bean/courseware';
export interface CoursewareResponse {
  F_keySign: string;
  F_keySignDomain: string;
  F_list: Courseware[];
  F_responseMsg: string;
  F_responseNo: number;
}
