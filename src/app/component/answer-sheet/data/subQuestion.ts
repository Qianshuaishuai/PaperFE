import { MarkGroup } from './markGroup';

export interface SubQuestion {
  height: number;
  minHeight: number;
  // 非选择题相关
  index?: number;
  isFirstPart?: boolean;
  type?: number;
  content?: any[];
  partIndex?: number;
  // 语文作文相关
  gridCount?: number;
  deltaCount?: number;
  // 英语作文相关
  lineCount?: number;
  // 填空题相关
  blankCount?: number;
  // 选择题相关
  markGroups?: MarkGroup[];
  lineCapacity?: number;
}
