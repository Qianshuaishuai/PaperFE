import { KeyPoint } from "../bean/keypoint";

export interface KeyPointResponse {
  F_responseMsg: string;
  F_responseNo?: number;
  F_stage_id?: string;
  F_list?: KeyPoint[];
}
