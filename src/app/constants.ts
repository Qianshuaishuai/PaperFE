import { environment } from '../environments/environment';

/*
*   Api地址
*/
export const BASE_URL = environment.production ? '//paper.ebag.readboy.com/' : '//120.77.238.241:7590/';
// cwq 的电脑
// export const BASE_URL = environment.production ? '//paper.ebag.readboy.com/' : '//192.168.2.184:6491/';
export const BASE_URL_BEIKE = environment.production ? '//beike-api.ebag.readboy.com/' : '//dreamtest.strongwind.cn:7290/';
export const TEX_URL = environment.production ? 'http://latex.ebag.readboy.com/tex?' : 'http://120.77.238.241:7690/tex?';
export const RESOLUTION_1024 = 1024;
export const RESOLUTION_1920 = 1920;
export const HEDDLE_ID = 98;
export const DANIEL_ID = 99;
export const PRIMARY = 'xiaoxue';
export const SENIOR = 'gaozhong';
export const JUNIOR = 'chuzhong';
export const PRIMARY_SCHOOL = 3;
export const JUNIOR_SCHOOL = 1;
export const SENIOR_SCHOOL = 2;
export const SALT = 'c7bbd6f8356b46ad0e3b83b75c74eec7';

// Course id map
export const CHINESE = 1;
export const MATH = 2;
export const ENGLISTH = 3;
export const PHYSICY = 4;
export const CHEMISTRY = 5;
export const BIOLOGY = 6;
export const POLITICS = 7;
export const HISTORY = 8;
export const GEOGRAPHY = 9;

// Paper Primary Course Id
export const PRIMARY_CHINESE = 30;
export const PRIMARY_MATH = 31;
export const PRIMARY_ENGLISH = 32;

// Paper Senior Course Id
export const SENIOR_CHINESE = 42;
export const SENIOR_MATH = 43;
export const SENIOR_ENGLISTH = 44;
export const SENIOR_PHYSICY = 45;
export const SENIOR_CHEMISTRY = 46;
export const SENIOR_BIOLOGY = 47;
export const SENIOR_HISTORY = 48;
export const SENIOR_GEOGRAPHY = 49;
export const SENIOR_POLITICS = 50;

// Paper Junior Course Id
export const JUNIOR_CHINESE = 53;
export const JUNIOR_MATH = 54;
export const JUNIOR_ENGLISTH = 55;
export const JUNIOR_PHYSICY = 56;
export const JUNIOR_CHEMISTRY = 57;
export const JUNIOR_BIOLOGY = 58;
export const JUNIOR_HISTORY = 59;
export const JUNIOR_GEOGRAPHY = 60;
export const JUNIOR_POLITICS = 61;

// Network request status code
export const SUCCESS = 10000;

// Question type id
export const SINGLE_CHOICE = 10001;
export const MULTIPLE_CHOICE = 10002;
export const INDEFINITE_CHOICE = 10003;
export const JUDGMENT = 10004;
export const OBJECTIVE_FILL = 10005;
export const SUBJECTIVE_FILL = 10006;
export const QUESTION_ANSWER = 10007;
export const SORT = 10008;
export const CONNECTION = 10009;
export const MATERIAL_SINGLE_CHOICE = 10010;
export const MATERIAL_MULTIPLE_CHOICE = 10011;
export const MATERIAL_INDEFINITE_CHOICE = 10012;
export const MATERIAL_JUDGMENT = 10013;
export const MATERIAL_OBJECTIVE_FILL = 10014;
export const MATERIAL_SUBJECTIVE_FILL = 10015;
export const QUIZ = 10016;
export const CLOZE = 10017;
export const SEVEN_SELECT_FIVE = 10018;

// Selector Height
// export const SELECTOR_NORMAL_HEIGHT = 142;
// export const SELECTOR_SEARCH_MODEL_HEIGHT = 100;
// export const SELECTOR_EXPEND_HEIGHT_1024 = 254;
// export const SELECTOR_EXPEND_HEIGHT_1920 = 216;

export const PAPER = -31;
export const GROUNP_VOLUME = -32;

export const OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

export const DELETE_PROMPT_MESSAGE = '你确定要删除吗？';
export const QUESTION_BASKET_NULL_MESSAGE = '试题篮为空的，请添加试题！';
export const DELETE_MINE_PAPER_MESSAGE = '你确定要删除此组卷吗？';
export const JOIN_QUESTION_BASKET_LIMIT_NUMBER_MESSAGE = '试题篮最多可加入 200 道试题';
export const REMOVE_ALL_FROM_QUESTION_BASKET_MESSAGE = '全部移出试题篮将会清空试题篮中的试题，你确定要清空吗？';
export const SAVE_PAPER_MESSAGE = '组卷试题为空，请先添加试题';

export const DEFAULT_GRADE_ID = 100;
export const QUESTION_BASKET_MAX_NUMBER = 200;

/**
 * 对话框提示信息类型
 *
 * 1 表示试题篮中题型删除按钮
 * 2 表示预览试卷页面删除按钮
 * 3 表示点击生成试卷时，如果试题篮没有题目，则弹出对话框并显示提示语
 * 4 表示在我的组卷列表点击删除组卷时，弹出提示框并显示提示语
 * 5 表示在点击全部加入试题篮按钮时，如果试题篮的题目已经有 200 道题，则弹出对话框并显示 “试题篮最多可加入 200 道试题”
 * 6 表示点击全部试题从试题篮移出时，弹出对话框并显示提示语
 * 7 表示保存组卷
 * 8 表示提交题目纠错
 */

export const QUESTION_BASKET_DELETE_QUESTION_TYPE = 1;
export const PREVIEW_PAPER_DELETE_QUESTION = 2;
export const CLICK_GENERATE_PAPER = 3;
export const DELETE_MINI_PAPER = 4;
export const JOIN_QUESTION_BASKET_LIMIT_NUMBER = 5;
export const REMOVE_ALL_FROM_QUESTION_BASKET = 6;
export const SAVE_PAPER = 7;


