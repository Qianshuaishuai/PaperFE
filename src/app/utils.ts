// tslint:disable-next-line:max-line-length
import {
  SENIOR, JUNIOR, CHINESE, JUNIOR_CHINESE, MATH, JUNIOR_MATH, ENGLISTH, JUNIOR_ENGLISTH, PHYSICY, JUNIOR_PHYSICY,
  CHEMISTRY, JUNIOR_CHEMISTRY, BIOLOGY, JUNIOR_BIOLOGY, HISTORY, JUNIOR_HISTORY, GEOGRAPHY, JUNIOR_GEOGRAPHY,
  POLITICS, JUNIOR_POLITICS, SENIOR_CHEMISTRY, SENIOR_CHINESE, SENIOR_MATH, SENIOR_ENGLISTH, SENIOR_PHYSICY,
  SENIOR_BIOLOGY, SENIOR_HISTORY, SENIOR_GEOGRAPHY, SENIOR_POLITICS, SINGLE_CHOICE, MULTIPLE_CHOICE, INDEFINITE_CHOICE,
  JUDGMENT, OBJECTIVE_FILL, SUBJECTIVE_FILL, QUESTION_ANSWER, SORT, CONNECTION, CLOZE, QUIZ, MATERIAL_SINGLE_CHOICE,
  MATERIAL_MULTIPLE_CHOICE, MATERIAL_JUDGMENT, MATERIAL_INDEFINITE_CHOICE, MATERIAL_OBJECTIVE_FILL,
  SEVEN_SELECT_FIVE,
  MATERIAL_SUBJECTIVE_FILL,
  PRIMARY_CHINESE,
  PRIMARY_MATH,
  PRIMARY_ENGLISH,
  PRIMARY,
  JUNIOR_SCHOOL,
  SENIOR_SCHOOL,
  PRIMARY_SCHOOL
} from './constants';

import { OPTIONS, SALT, TEX_URL } from './constants';
import { Md5 } from 'ts-md5/dist/md5';
import { Base64 } from 'js-base64';
import { Question } from './component/details/paper-details/data/paperDetailsResponse';
import * as _ from 'lodash';

// const baseUrl = 'http://ozuzef1u3.bkt.clouddn.com/'; // 测试地址
const baseUrl = 'https://ebag-lab.ebag.readboy.com/' ; // 正式地址

const imageUrl = 'img/';
const audioUrl = 'audio/';
const paperUrl = 'paper';

let gradeType = 'gaozhong/';

const answerItems = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

export class Utils {

  // 处理需要渲染的html标签
  dealStr(str, isOption): string {
    // str = this.matchingP(str);
    str = this.matchTex(str);
    str = this.matchWavy(str);
    str = this.matchingImg(str);
    str = this.matchingDot(str);
    str = this.matchingInputTag(str, isOption);
    // str = this.matchingInput(str);
    // str = this.matchingU(str);
    // str = this.matchingUd(str);
    // str = this.matchingTab(str);
    // str = this.matchingBr(str);
    // str = this.matchingA(str);
    // str = this.matchingForEnglish(str);
    // str = this.matchingSpecialTex(str);
    // str = this.matchingErrorHtml(str);
    return this.dealTex(str);
  }

  // 处理英语短文填空的input标签
  matchingInput(t): void {
    t = t.replace(/\[input=(.*?)\](.*?)\[\/input\]/g, function ($0, $1, $2) {
      return '<input>          </input>';
    });
    return t;
  }

  // 处理u标签
  matchingU(t): void {
    t = t.replace(/\[u\]/g, '\<u\>');
    t = t.replace(/\[\/u\]/g, '\<\/u\>');
    return t;
  }

  // 处理ud标签
  matchingUd(t): void {
    t = t.replace(/\[ud\]/g, '\<ud\>');
    t = t.replace(/\[\/ud\]/g, '\<\/ud\>');
    return t;
  }

  // 处理tab标签
  matchingTab(t): void {
    t = t.replace(/\[tab\]/g, '\<tab\>');
    t = t.replace(/\[\/tab\]/g, '\<\/tab\>');
    return t;
  }

  // 处理br标签
  matchingBr(t): void {
    t = t.replace(/\[br\]/g, '\<br\>');
    t = t.replace(/\[\/br\]/g, '\<\/br\>');
    return t;
  }

  // 清除公式的标签
  matchTex(t): string {
    if (t === undefined) {
      return t;
    }
    // t = t.replace(/\<tex=(.*?)\>/g, '');
    t = t.replace(/%\<\/tex\>/g, '\<\/tex\>');
    // t = t.replace(/\<tex = (.*?)\>/g, '');
    // t = t.replace(/ % \<\/tex\>/g, '');
    return t;
  }


  // 处理图片标签
  matchingImg(t): string {
    // if (t === undefined) {
    //   return t;
    // }

    t = t.replace(/\<img(.*?)\>/g, function ($0, $1, $2) {
      const rest = '\<img style="max-width:95%" ' + $1 + '>';
      return rest;
    });

    if (!!t && /<img(.*?)>(.*?)<\/img>/.test(t)) {
      t = t.replace(/\<img(.*?)\>(.*?)\<\/img\>/g, function ($0, $1, $2) {
        const rest = '\<img src=\'' + baseUrl + gradeType + imageUrl + $2 + '\'\>\<\/img\>';
        return rest;
      });
    }

    return t;
  }

  // 把 <input> 标签替换为下划线
  matchingInputTag(t, isOption): string {
    // if (t === undefined || t.indexOf('<input') === -1) {
    //   return t;
    // }
      if (!!t && /<input(.*?)><\/input>/.test(t)) {
        if (isOption) {
          // 替换为括号 (   )
          t = t.replace(/\(\<input(.*?)\>\<\/input\>\)/g, function($0, $1, $2) {
            // const result = '(<input ' + $1 + 'readonly=""' +
            // 'style="border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
            // 'border-bottom: 0px solid; outline: none"' + '></input>)';
            $1 = $1.replace(/\,/, '');
            const result = '(<span ' + $1 +
            'style="text-align: center; font-size:16px; border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
            'border-bottom: 0px solid; outline: none; display: inline-block; width: 30px;"' + '></span>)';
            return result;
          });

          // 替换为括号 (   )
          if (t.indexOf('readonly') <= 0) {
            t = t.replace(/\<input(.*?)\>\<\/input\>/g, function($0, $1, $2) {
              // const result = '(<input ' + $1 + 'readonly=""'
              // + 'style="border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
              // 'border-bottom: 0px solid; outline: none"' + '></input>)';
              $1 = $1.replace(/\,/, '');
              const result = '(<span ' + $1 +
              'style="text-align: center; font-size:16px; border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
              'border-bottom: 0px solid; outline: none; display: inline-block; width: 30px;"' + '></span>)';
              return result;
            });
          }
        } else {
          // 替换为括号 (   )

          if (t.indexOf(`size='14'`) < 0) {
            t = t.replace(/\(\<input(.*?)\>\<\/input\>\)/g, function($0, $1, $2) {
              // const result = '(<input ' + $1 +
              // 'style="text-align: center; font-size:16px; border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
              // 'border-bottom: 0px solid; outline: none;" contenteditable="true"' + '></input>)';
              // console.log(result);
              $1 = $1.replace(/\,/, '');
              const result = '(<span ' + $1 +
              'style="text-align: center; font-size:16px; border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
              'border-bottom: 0px solid; outline: none; display: inline-block; width: 30px;"' + '></span>)';
              return result;
            });
          } else {
            // 替换为下划线
            t = t.replace(/\<input(.*?)\>\<\/input\>/g, function($0, $1, $2) {
              const result = `<pos onclick="document.getElementById(this.id.replace('line', 'answer'))"
                      contenteditable="false"></pos>`;
              return result;
            });
          }

          if ( t.indexOf('border-bottom') <= 0) {
            // 替换为下划线
            t = t.replace(/\<input(.*?)\>\<\/input\>/g, function($0, $1, $2) {
              // const result = '<input ' + $1 +
              // 'style="text-align: center; font-size:16px; border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
              // 'border-bottom: 1px solid; outline: none"' + '></input>';
              // $1 = $1.replace(/\,/, '');
              // const result = '<span ' + $1 +
              // 'style="text-align: center; font-size:16px; border-right: 0px solid; border-top: 0px solid; border-left: 0px solid; ' +
              // 'border-bottom: 0px solid; outline: none;"' + '>__________</span>';
              // const result = `&nbsp;<pos contenteditable="false" id="0"></pos>&nbsp;`;
              const result = `<pos onclick="document.getElementById(this.id.replace('line', 'answer'))"
                      contenteditable="false"></pos>`;
              return result;
            });
          }
        }
      }
    return t;
  }

  // 转换json数据自带的分割标签
  matchingP(t): void {
    t = t.replace(/\[\/p\]/g, '</p>');
    t = t.replace(/\[\\\/p\]/g, '</p>');
    t = t.replace(/\[p=(.*?)\]/g, '<p>');
    t = t.replace(/\[p\]/g, '<p>');
    return t;
  }

  // 去掉json数据自带的分割标签
  matchingPp(t): void {
    t = t.replace(/\[\/p\]/g, '');
    t = t.replace(/\[\\\/p\]/g, '');
    t = t.replace(/\[p=(.*?)\]/g, '');
    t = t.replace(/\[p\]/g, '');
    return t;
  }

  // 去掉转义符号
  matchingA(t): void {
    t = t.replace(/\\]/g, '');
    return t;
  }

  // 英语材料标签处理
  matchingForEnglish(t) {
    t = t.replace(/\[b\]/g, '\<b\>');
    t = t.replace(/\[\/b\]/g, '\<\/b\>');
    t = t.replace(/\[i\]/g, '\<i\>');
    t = t.replace(/\[\/i\]/g, '\<\/i\>');
    return t;
  }

  // 把波浪线替换成斜杠
  matchWavy(t) {
    if (t === undefined) {
      return t;
    }
    return t.replace(/(~@)+/ig, '\\');
  }

  // 处理加点文字
  matchingDot(t) {
    if (!!t && /<ud>.*?<\/ud>/.test(t)) {
      t = t.replace(/\<ud\>(.*?)\<\/ud\>/g, function ($0, $1, $2) {
        const result = '<label class="dot">' + $1 + '</label>';
        return result;
      });
    }

    return t;
  }

  // 公式转换
  // tslint:disable-next-line:one-line
  dealTex(tex: string): string {
    if (tex === undefined) {
      return;
    }
    const regex = new RegExp(/\<tex(.*?)\>.*?\<\/tex\>/g);
    // const regex = new RegExp(/\$\$(.*?)\$\$/g);
    const texs = tex.match(regex);

    if (texs !== null) {
      texs.forEach((item, index) => {
        item = item.substring(item.indexOf('>') + 1, item.lastIndexOf('<'));
        const urlSafeBase64 = Base64.encodeURI(item);
        const md5 = Md5.hashStr(SALT + urlSafeBase64);
        const url = TEX_URL + 'tex=' + urlSafeBase64 + '&' + 'token=' + md5;
        const img = '<img style="vertical-align: middle;" src="' + url + '"\/>';
        tex = tex.replace(/\<tex(.*?)\>.*?\<\/tex\>/, img);
      });
    } else {
    }
    return tex;
  }

  // 处理特殊公式
  matchingSpecialTex(t) {
    t = t.replace(/\\celsius/g, '°');
    t = t.replace(/\\degree/g, '°');
    t = t.replace(/\\circled1/g, '①');
    t = t.replace(/\\circled2/g, '②');
    t = t.replace(/\\circled3/g, '③');
    t = t.replace(/\\circled4/g, '④');
    t = t.replace(/\\circled5/g, '⑤');
    t = t.replace(/\\circled6/g, '⑥');
    t = t.replace(/\\circled7/g, '⑦');
    t = t.replace(/\\circled8/g, '⑧');
    t = t.replace(/\\circled9/g, '⑨');
    t = t.replace(/\\circled\{1\}/g, '①');
    t = t.replace(/\\circled\{2\}/g, '②');
    t = t.replace(/\\circled\{3\}/g, '③');
    t = t.replace(/\\circled\{4\}/g, '④');
    t = t.replace(/\\circled\{5\}/g, '⑤');
    t = t.replace(/\\circled\{6\}/g, '⑥');
    t = t.replace(/\\circled\{7\}/g, '⑦');
    t = t.replace(/\\circled\{8\}/g, '⑧');
    t = t.replace(/\\circled\{9\}/g, '⑨');

    // t = t.replace(/\$\$(.*?)<(.*?)\$\$/g, function ($0, $1, $2) {
    //     return '$$' + $1 + '＜' + $2 + '$$';
    // });
    return t;
  }

  // 处理回传数据含有非法中文字符
  matchingErrorHtml(t) {
    t = t.replace(/\＜/g, '<');
    return t;
  }

  // 删除为0的元素
  deleteNotNeed(a) {
    let i = a.length;
    while (i--) {
      if (a[i] === '0') {
        a.splice(i, 1);
      }
    }
    return a;
  }

  // 难度系数转换字符串
  matchingDifficulty(difficulty): string {
    // tslint:disable-next-line:curly
    if (difficulty < 4.0) return '难度：困难';
    // tslint:disable-next-line:curly
    else if (difficulty >= 4.0 && difficulty < 5.1) return '难度：一般';
    // tslint:disable-next-line:curly
    else if (difficulty >= 5.1) return '难度：简单';
  }

  // 阿拉伯数字转为中文数字
  matchingNumber(num) {
    const china = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五');
    const str = china[num];
    return str;
  }

  // 获取对应的选择题序号
  getSelectionName(item): string {
    // return answerItems[item];
    return String.fromCharCode(65 + item);
  }

  // 获取题目的序号
  getQuestionNumber(data): string {
    const source = data.source;
    const number = source.replace(/(.*?)第(.*?)题/g, function ($0, $1, $2) {
      if ($2.length > 3) {
        const index = String($2).indexOf('第');
        $2 = String($2).substring(index + 1, $2.length);
      }
      return $2;
    });
    return number + '.';
  }

  // 设置本卷的所属类型，初中/高中
  setResGradeType(phase): void {
    if (phase === 1) {
      gradeType = 'chuzhong/';
    } else if (phase === 2) {
      gradeType = 'gaozhong/';
    } else {
      gradeType = '';
    }
  }

  /**
   * 获取题目序号
   * @param str 题目内容
   * @param index 题目索引
   * @param flag 标识是否材料题 1 表示不是材料题 0 表示材料题
   */
  getQuestionSerialNumber(question: Question, index: number, flag: number): string {
    // const score = '<span style="font-size: 16px; color: #999; margin-left: 22px;" id="' +
    //   question.id + '">  （' + question.score + '分）</span>';
    const spanElement = `<span style="margin-left: 20px;" id="${question.id}"></span>`;
    if (flag === 0) {
      return question.content.replace(/\<p(.*?)\>/, '<p>' + spanElement);
    } else {
      if (question.content === '') {
        return question.content = spanElement;
      } else {
        return question.content.replace(/\<p(.*?)\>/, '<p>' + '（' + index + '）' + spanElement);
      }
    }
  }

  getOptionSerialNumber(str: string, index: number): string {
    if (str.indexOf('<p>') !== -1) {
      return str.replace(/\<p\>/, '<p>' + OPTIONS[index] + '. ');
    } else {
      return OPTIONS[index] + '. ' + str;
    }
  }

  transform(phase: string): number {
    if (JUNIOR === phase) {
      return JUNIOR_SCHOOL;
    } else if (SENIOR === phase) {
      return SENIOR_SCHOOL;
    } else if (PRIMARY === phase) {
      return PRIMARY_SCHOOL;
    }
  }

  dealSolveDialogContent(content: string, score: number): string {
    return content.replace(/\<p\>(.*?)\<span(.*?)\>(.*?)\<\/span\>/, function ($0, $1, $2, $3) {
      return '<p>' + $1 + '<span ' + $2 + '>（' + score + '分）</span>';
    });
  }

  mapCourseId(stageId: number, courseId: number): number {
    if (stageId === JUNIOR_SCHOOL) {
      if (courseId === CHINESE) {
        return JUNIOR_CHINESE;
      } else if (courseId === MATH) {
        return JUNIOR_MATH;
      } else if (courseId === ENGLISTH) {
        return JUNIOR_ENGLISTH;
      } else if (courseId === PHYSICY) {
        return JUNIOR_PHYSICY;
      } else if (courseId === CHEMISTRY) {
        return JUNIOR_CHEMISTRY;
      } else if (courseId === BIOLOGY) {
        return JUNIOR_BIOLOGY;
      } else if (courseId === HISTORY) {
        return JUNIOR_HISTORY;
      } else if (courseId === GEOGRAPHY) {
        return JUNIOR_GEOGRAPHY;
      } else if (courseId === POLITICS) {
        return JUNIOR_POLITICS;
      }
    } else if (stageId === SENIOR_SCHOOL) {
      if (courseId === CHINESE) {
        return SENIOR_CHINESE;
      } else if (courseId === MATH) {
        return SENIOR_MATH;
      } else if (courseId === ENGLISTH) {
        return SENIOR_ENGLISTH;
      } else if (courseId === PHYSICY) {
        return SENIOR_PHYSICY;
      } else if (courseId === CHEMISTRY) {
        return SENIOR_CHEMISTRY;
      } else if (courseId === BIOLOGY) {
        return SENIOR_BIOLOGY;
      } else if (courseId === HISTORY) {
        return SENIOR_HISTORY;
      } else if (courseId === GEOGRAPHY) {
        return SENIOR_GEOGRAPHY;
      } else if (courseId === POLITICS) {
        return SENIOR_POLITICS;
      }
    } else if (stageId === PRIMARY_SCHOOL) {
      if (courseId === CHINESE) {
        return PRIMARY_CHINESE;
      } else if (courseId === MATH) {
        return PRIMARY_MATH;
      } else if (courseId === ENGLISTH) {
        return PRIMARY_ENGLISH;
      }
    }
  }

  mapCourseIdFromPaperToEbag(courseId: number): number {
    switch (courseId) {
      case PRIMARY_CHINESE:
      case JUNIOR_CHINESE:
      case SENIOR_CHINESE:
        return CHINESE;

      case PRIMARY_MATH:
      case JUNIOR_MATH:
      case SENIOR_MATH:
        return MATH;

      case PRIMARY_ENGLISH:
      case JUNIOR_ENGLISTH:
      case SENIOR_ENGLISTH:
        return ENGLISTH;

      case JUNIOR_PHYSICY:
      case SENIOR_PHYSICY:
        return PHYSICY;

      case JUNIOR_CHEMISTRY:
      case SENIOR_CHEMISTRY:
        return CHEMISTRY;

      case JUNIOR_BIOLOGY:
      case SENIOR_BIOLOGY:
        return BIOLOGY;

      case JUNIOR_HISTORY:
      case SENIOR_HISTORY:
        return HISTORY;

      case JUNIOR_GEOGRAPHY:
      case SENIOR_GEOGRAPHY:
        return GEOGRAPHY;

      case JUNIOR_POLITICS:
      case SENIOR_POLITICS:
        return POLITICS;
    }
  }

  mapQuestionType(type: number): string {
    switch (type) {
      case SINGLE_CHOICE:
        return '单选题';

      case MULTIPLE_CHOICE:
        return '多选题';

      case INDEFINITE_CHOICE:
        return '不定项选择题';

      case JUDGMENT:
        return '判断题';

      case OBJECTIVE_FILL:
        return '客观填空题';

      case SUBJECTIVE_FILL:
        return '主观填空题';

      case QUESTION_ANSWER:
        return '问答题';

      case SORT:
        return '排序题';

      case CONNECTION:
        return '连线题';

      case MATERIAL_SINGLE_CHOICE:
      case MATERIAL_MULTIPLE_CHOICE:
      case MATERIAL_INDEFINITE_CHOICE:
      case MATERIAL_JUDGMENT:
      case MATERIAL_OBJECTIVE_FILL:
      case MATERIAL_SUBJECTIVE_FILL:
        return '材料题';

      case QUIZ:
        return '图文问答题';

      case CLOZE:
        return '完型填空';

      case SEVEN_SELECT_FIVE:
        return '七选五';

      default:
        return '';
    }
  }

  mapStage(stageId: number): string {
    switch (stageId) {
      case PRIMARY_SCHOOL:
        return 'xiaoxue';

      case JUNIOR_SCHOOL:
        return 'chuzhong';

      case SENIOR_SCHOOL:
        return 'gaozhong';

      default:
        return '';
    }
  }

  mapStageNameToStageId(stage: string) {
    switch (stage) {
      case 'xiaoxue':
        return PRIMARY_SCHOOL;

      case 'chuzhong':
        return JUNIOR_SCHOOL;

      case 'gaozhong':
        return SENIOR_SCHOOL;

      default:
        return 0;
    }
  }

  mapStageIdToStageName(stageId: number): string {
    switch (stageId) {
      case PRIMARY_SCHOOL:
        return '小学';

      case JUNIOR_SCHOOL:
        return '初中';

      case SENIOR_SCHOOL:
        return '高中';

      default:
        return '';
    }
  }

  mapCourseIdToSubject(courseId: number) {
    switch (courseId) {
      case PRIMARY_CHINESE:
      case JUNIOR_CHINESE:
      case SENIOR_CHINESE:
        return '语文';

      case PRIMARY_MATH:
      case JUNIOR_MATH:
      case SENIOR_MATH:
        return '数学';

      case PRIMARY_ENGLISH:
      case JUNIOR_ENGLISTH:
      case SENIOR_ENGLISTH:
        return '英语';

      case JUNIOR_PHYSICY:
      case SENIOR_PHYSICY:
        return '物理';

      case JUNIOR_CHEMISTRY:
      case SENIOR_CHEMISTRY:
        return '化学';

      case JUNIOR_BIOLOGY:
      case SENIOR_BIOLOGY:
        return '生物';

      case JUNIOR_HISTORY:
      case SENIOR_HISTORY:
        return '历史';

      case JUNIOR_GEOGRAPHY:
      case SENIOR_GEOGRAPHY:
        return '地理';

      case JUNIOR_POLITICS:
        return '思想品德';

      case SENIOR_POLITICS:
        return '政治';

      default:
        return '';
    }
  }

  getCurrentDate(): string {
    const date = new Date();
    return date.getFullYear() + ' 年 ' + (date.getMonth() + 1) + ' 月 ' + date.getDate() + ' 日';
  }
}
