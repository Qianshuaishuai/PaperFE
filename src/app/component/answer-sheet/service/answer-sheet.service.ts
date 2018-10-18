import { Injectable } from '@angular/core';

import { AnswerSheetTemplateService } from './answer-sheet-template.service';
import { QuestionsService } from './questions.service';

import { AnswerSheet } from '../data/answerSheet';
import { AnswerSheetOption } from '../data/answerSheetOption';
import { Question } from '../data/question';
import { SubQuestion } from '../data/subQuestion';

@Injectable({
  providedIn: 'root'
})
export class AnswerSheetService {

  private nextIndex = 0;
  private constTemplate: AnswerSheet[];
  // 当前模板，用来为获取下一张模板服务
  private currentTemplate: AnswerSheet[];

  constructor(
    private answerSheetTemplateService: AnswerSheetTemplateService,
    private questionsService: QuestionsService
  ) { }

  // 遍历 questions，把每一项塞进 answerSheet，塞满后把 answerSheet 塞进 result，换下一个 answerSheet 继续塞
  private assignQuestionsToAnswerSheets(constQuestions: Question[]): AnswerSheet[] {
    const result: AnswerSheet[] = [];
    const questions: Question[] = JSON.parse(JSON.stringify(constQuestions));
    let answerSheet = JSON.parse(JSON.stringify(this.getNextTemplate()));
    for (let i = 0; i !== questions.length; i++) {
      // 判断容量，容量足够，则直接塞进去
      if (questions[i].height <= answerSheet.capacity) {
        if (questions[i].isMark) {
          this.setNoAnswerZone(this.currentTemplate, questions[i].height);
        }
        answerSheet.questions.push(questions[i]);
        answerSheet.capacity -= questions[i].height;
        continue;
      }
      // 不够，进一步判断剩余容量是否达到最低要求
      if (answerSheet.capacity < questions[i].minHeight) {
        // 达不到最低要求，使用下一张答题卡，并跳到下一次循环
        result.push(answerSheet);
        answerSheet = JSON.parse(JSON.stringify(this.getNextTemplate()));
        i--; // 下一次还判断这道题
        continue;
      }
      // 达到要求，对questions[i]进行拆分，拆出来的部分塞进当前答题卡
      const theOtherPart = this.separateQuestion(questions[i], answerSheet);
      answerSheet.questions.push(theOtherPart);
      result.push(answerSheet);
      // 换一张答题卡，进入下一次循环，处理修改后的原来部分
      answerSheet = JSON.parse(JSON.stringify(this.getNextTemplate()));
      i--;
    }
    result.push(answerSheet);
    return result;
  }

  private getNextTemplate(): AnswerSheet {
    if (this.nextIndex < this.currentTemplate.length) {
      return this.currentTemplate[this.nextIndex++];
    } else {
      // 用完了一张纸（可能被修改过），使用下一张干净的纸
      this.currentTemplate = JSON.parse(JSON.stringify(this.constTemplate));
      this.nextIndex = 0;
      return this.currentTemplate[this.nextIndex++];
    }
  }

  private setNoAnswerZone(answerSheetTemplate: AnswerSheet[], height: number): void {
    if (this.nextIndex <= (answerSheetTemplate.length / 2)) {
      const backPage = answerSheetTemplate[answerSheetTemplate.length - this.nextIndex];
      backPage.capacity -= backPage.isDangerZone ? 0 : 17;
      backPage.isDangerZone = true;
      backPage.noAnswerAreaHeight += height;
      backPage.capacity -= backPage.isSetNoAnswerArea ? height : 0;
    }
  }

  // 拆分超容问题
  private separateQuestion(originQuestion: Question, answerSheet: AnswerSheet): Question {
    let result;
    if (originQuestion.isMark) {
      result = this.separateMarkQuestion(originQuestion, answerSheet.capacity);
      this.setNoAnswerZone(this.currentTemplate, result.height);
    } else {
      if (originQuestion.subQuestions[0].type === 0) {
        result = this.separateChineseComposition(originQuestion, answerSheet.capacity,
          answerSheet.mainWidth, answerSheet.isLeftBorder);
      } else if (originQuestion.subQuestions[0].type === 1) {
        result = this.separateEnglishComposition(originQuestion, answerSheet.capacity);
      } else {
        result = this.separateNonMarkQuestion(originQuestion, answerSheet.capacity);
      }
    }
    return result;
  }

  // 拆分超容的选择型大题，返回值为拆出来放到当前答题卡的部分，修改的原值待放进下一张答题卡
  // 可能要更新minHeight
  private separateMarkQuestion(originQuestion: Question, constCapacity: number): Question {
    const subQuestions = originQuestion.subQuestions;
    let capacity = constCapacity - (originQuestion.isFirstPart ? 6 : 0);
    const separatedQuestion = JSON.parse(JSON.stringify(originQuestion));
    const separatedSubQuestions = [];
    let i = 0;
    let separatedHeight = 0;
    let originHeight = 0;
    // 能放多少subQuestion就放多少，放不下的直接放到下一题
    for (i = 0; i !== subQuestions.length; i++) {
      if (subQuestions[i].height <= capacity) {
        separatedSubQuestions.push(subQuestions[i]);
        separatedHeight += subQuestions[i].height;
        capacity -= subQuestions[i].height;
      } else {
        break;
      }
    }
    separatedQuestion.subQuestions = separatedSubQuestions;
    separatedQuestion.height = separatedHeight + (separatedQuestion.isFirstPart ? 6 : 0);
    originQuestion.subQuestions = originQuestion.subQuestions.slice(i);
    for (let j = 0; j !== originQuestion.subQuestions.length; j++) {
      originHeight += originQuestion.subQuestions[j].height;
    }
    originQuestion.height = originHeight;
    originQuestion.isFirstPart = false;

    return separatedQuestion;
  }

  private separateContent(separatedSubQuestion: SubQuestion, originSubQuestion: SubQuestion, capacity: number, minHeight: number): void {
    // let currentHeight = 0;
    let contentIndex;
    separatedSubQuestion.height = capacity;
    const contents = separatedSubQuestion.content;
    for (contentIndex = 0; contentIndex !== contents.length; contentIndex++) {
      if (contents[contentIndex].partIndex === separatedSubQuestion.partIndex) {
        separatedSubQuestion.content.splice(++contentIndex, contents.length - contentIndex);
        break;
      }
      // currentHeight += contents[contentIndex].height;
      // if (currentHeight > separatedSubQuestion.height) {
        // separatedSubQuestion.content.splice(contentIndex, contents.length - contentIndex);
        // break;
      // }
    }
    // 修改原本的放到下一大题
    originSubQuestion.content.splice(0, contentIndex);
    let remainHeight = 0;
    for (let i = 0; i !== originSubQuestion.content.length; i++) {
      remainHeight += originSubQuestion.content[i].height;
    }
    const subHeight = originSubQuestion.height - capacity;
    originSubQuestion.height = Math.max(remainHeight, subHeight, minHeight);
    originSubQuestion.isFirstPart = false;
    originSubQuestion.partIndex++;
  }

  // 拆分超容的非选择类大题，返回值为拆出来放到当前答题卡的部分，修改的原值待放进下一张答题卡
  private separateNonMarkQuestion(originQuestion: Question, constCapacity: number): Question {
    const subQuestions = originQuestion.subQuestions;
    const separatedQuestion = JSON.parse(JSON.stringify(originQuestion));
    const separatedSubQuestions = [];
    let capacity = constCapacity - (originQuestion.isFirstPart ? 6 : 0);
    let minHeight = 0;
    let separatedHeight = 0;
    let originHeight = 0;
    let i = 0;
    // 能放多少subQuestion就放多少，放不下的进一步判断
    for (i = 0; i !== subQuestions.length; i++) {
      if (subQuestions[i].height <= capacity) {
        separatedSubQuestions.push(subQuestions[i]);
        separatedHeight += subQuestions[i].height;
        capacity -= subQuestions[i].height;
        continue;
      }
      minHeight = subQuestions[i].minHeight;
      // 剩下容量达不到最小容量，直接跳到下一题
      if (capacity < minHeight) {
        separatedQuestion.height = separatedHeight + (separatedQuestion.isFirstPart ? 6 : 0);
        break;
      }
      // 放得下，进行拆分，拆出来的放到当前大题
      const separatedSubQuestion = JSON.parse(JSON.stringify(subQuestions[i]));
      this.separateContent(separatedSubQuestion, subQuestions[i], capacity, minHeight);
      separatedSubQuestions.push(separatedSubQuestion);
      separatedQuestion.height = separatedHeight + capacity + (separatedQuestion.isFirstPart ? 6 : 0);
      break;
    }
    separatedQuestion.subQuestions = separatedSubQuestions;
    originQuestion.subQuestions = subQuestions.slice(i);
    for (let j = 0; j !== originQuestion.subQuestions.length; j++) {
      originHeight += originQuestion.subQuestions[j].height;
    }
    originQuestion.height = originHeight;
    originQuestion.isFirstPart = false;

    return separatedQuestion;
  }

  // 拆分超容的英语作文题，返回值为拆出来放到当前答题卡的部分，修改的原值待放进下一张答题卡
  private separateEnglishComposition(originQuestion: Question, constCapacity: number): Question {
    const separatedQuestion: Question = JSON.parse(JSON.stringify(originQuestion));

    const capacity = constCapacity - (originQuestion.isFirstPart ? 6 : 0);
    const lineCount = Math.floor(capacity / 10);

    separatedQuestion.subQuestions[0].lineCount = lineCount;
    const separatedHeight = lineCount * 10 + 2;
    separatedQuestion.subQuestions[0].height = separatedHeight + (separatedQuestion.isFirstPart ? 5 : 0);
    separatedQuestion.height = separatedHeight + (separatedQuestion.isFirstPart ? 11 : 0);

    originQuestion.subQuestions[0].content = [];
    originQuestion.subQuestions[0].lineCount -= lineCount;
    const originHeight = originQuestion.subQuestions[0].lineCount * 10 + 2;
    originQuestion.subQuestions[0].height = originHeight;
    originQuestion.height = originHeight;
    originQuestion.isFirstPart = false;
    originQuestion.subQuestions[0].isFirstPart = false;

    return separatedQuestion;
  }

  // 拆分超容的语文作文题，返回值为拆出来放到当前答题卡的部分，修改的原值待放进下一张答题卡
  private separateChineseComposition(originQuestion: Question, constCapacity: number,
    mainWidth: number, isLeftBorder: boolean): Question {
    const separatedQuestion: Question = JSON.parse(JSON.stringify(originQuestion));
    // 当前答题卡剩余容量 = 答题卡剩余总容量 - 潜在的标题高度 - 留白
    const capacity = constCapacity - (originQuestion.isFirstPart ? 11 : 2);
    // 能装下的行数
    const lineCount = Math.floor(capacity / 10);
    // 一行能装下的格数
    let lineCapacity;
    switch (mainWidth) {
      // 一二栏的宽度
      case 180: lineCapacity = 22; break;
      // 三栏左右页宽度
      case 118: lineCapacity = 14; break;
      // 三栏中间页宽度
      case 136: lineCapacity = 16; break;
    }
    // 剩下空间能装下的格数
    const gridCount = lineCount * lineCapacity;
    // 更新拆分出来的部分的相关数据
    separatedQuestion.subQuestions[0].gridCount = gridCount;
    const separatedHeight = lineCount * 10 + 2;
    separatedQuestion.subQuestions[0].height = separatedHeight + (separatedQuestion.isFirstPart ? 5 : 0);
    separatedQuestion.height = separatedHeight + (separatedQuestion.isFirstPart ? 11 : 0);
    // 更新原来部分
    originQuestion.subQuestions[0].content = [];
    originQuestion.subQuestions[0].gridCount -= gridCount;
    // 根据下一张答题卡的宽度重新计算lineCapacity
    if (lineCapacity === 16) { lineCapacity = 14; }
    if (lineCapacity === 14 && isLeftBorder) { lineCapacity = 16; }
    const originHeight = Math.ceil(originQuestion.subQuestions[0].gridCount / lineCapacity) * 10 + 2;
    originQuestion.subQuestions[0].height = originHeight;
    originQuestion.height = originHeight;
    originQuestion.isFirstPart = false;
    originQuestion.subQuestions[0].isFirstPart = false;
    originQuestion.subQuestions[0].deltaCount += gridCount;
    return separatedQuestion;
  }

  // 补全纸张（无论是否有题目，答题卡都要有完整的定位点）
  private completePaper(answerSheets: AnswerSheet[], ast: AnswerSheet[]): void {
    const templateLength = ast.length;
    const sheetsLength = answerSheets.length;
    switch (templateLength) {
      /*
      一栏
      case 2:
        do nothing;
      */
      // 两栏
      case 4:
        if (sheetsLength % 2 !== 0) {
          const nextIndex = sheetsLength % templateLength;
          answerSheets.push(JSON.parse(JSON.stringify(ast[nextIndex])));
        }
        break;
      // 三栏
      case 6:
        if (sheetsLength % 3 !== 0) {
          let nextIndex = sheetsLength % templateLength;
          answerSheets.push(JSON.parse(JSON.stringify(ast[nextIndex])));
          if (nextIndex === 1 || nextIndex === 4) {
            answerSheets.push(JSON.parse(JSON.stringify(ast[++nextIndex])));
          }
        }
        break;
    }
  }

  // 生成页码定位点
  private generatePageIndex(result: AnswerSheet[], astLength: number): void {
    // 超过一张答题卡才需要生成
    if (result.length > astLength) {
      switch (astLength) {
        // 一栏
        case 2:
          for (let i = 0; i !== result.length; i++) {
            result[i].pageIndex = i + 1;
            // 最多生成两张答题卡
            if (i > 3) { break; }
          }
          break;
        // 两栏
        case 4:
          for (let i = 0; i !== result.length; i++) {
            result[i].pageIndex = Math.floor(i / 2) + 1;
            // 最多生成两张答题卡
            if (i > 7) { break; }
          }
          break;
        // 三栏
        case 6:
          for (let i = 0; i !== result.length; i++) {
            if ((i + 1) % 3 !== 0) {
              result[i].pageIndex = Math.floor(i / 3) + 1;
            }
            // 最多生成两张答题卡
            if (i > 11) { break; }
          }
          break;
      }
    }
  }

  generateAnswerSheets(answerSheetOption: AnswerSheetOption, questions: Question[]): AnswerSheet[] {
    this.nextIndex = 0;
    this.constTemplate = this.answerSheetTemplateService.getAnswerSheetTemplate(answerSheetOption);
    this.currentTemplate = JSON.parse(JSON.stringify(this.constTemplate));
    const result = this.assignQuestionsToAnswerSheets(questions);
    this.completePaper(result, this.currentTemplate);
    this.generatePageIndex(result, this.currentTemplate.length);
    return result;
  }
}
