/*
 *questions 与 答题卡各大题答题框的对应关系
 *  非选择：
 *    <as-question>：大题 question
 *      <textarea>：标题 question.title
 *      <div class="answerZone">：小题 subQuestion
 *  选择题：
 *    <as-question>：选择题 question
 *      <textarea>：标题 question.title
 *      <div class="answerZone">：
 *        <div class="markContainer">：一大行 subQuestion
 *          <ul class="markGroup">：一列 markGroup
 *            <li class="markItem">：小题 questionIndex
 */
import { Injectable } from '@angular/core';

import { MarkGroup } from '../data/markGroup';
import { MarkSubQuestion } from '../data/markSubQuestion';
import { Question } from '../data/question';
import { SubQuestion } from '../data/subQuestion';

import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  // 魔法数字
  // 选择题相关
  // 一行的容量(mm)
  private LineCapacity_Wide = 180;
  private LineCapacity_Narrow = 118;
  // 高度相关(mm)
  private Height_Per_MarkSubQuestion = 5;
  private Padding_Vertical_MarkGroup = 5;
  // 宽度相关(mm)
  private Width_Per_Option = 6;
  private Padding_Horizontal_MarkGroup = 8;

  // 处理完的问题
  private questions: Question[] = [];
  // 合并选择题后的问题
  private preQuestions = [];
  // 选择题切分点（元素为大题结束时的小题总长度）
  private breakPoints: number[] = [];

  constructor() { }

  // 清除一切数据、状态
  cleanUp(): void {
    this.breakPoints = [];
    this.preQuestions = [];
    this.questions = [];
  }

  // 判断是否是选择题
  private isMarkQuestion(type: number): boolean {
    switch (type) {
      case 10001:
      case 10002:
      case 10003:
      case 10004:
        return true;
      default:
        return false;
    }
  }

  private calcGroupHeight(groupCapacity: number): number {
    return groupCapacity * this.Height_Per_MarkSubQuestion + this.Padding_Vertical_MarkGroup;
  }

  private calcGroupWidth(optionCount: number): number {
    return optionCount * this.Width_Per_Option + this.Padding_Horizontal_MarkGroup;
  }

  // 生成选择题
  private generateMarkSubQuestions(isThreeCol: boolean, judgementType: boolean, groupCapacity, question: Question, questionsContent): void {
    const lineCapacity = isThreeCol ? this.LineCapacity_Narrow : this.LineCapacity_Wide;
    const allMarkGroups = this.generateAllMarkGroups(questionsContent, groupCapacity, judgementType);
    const groupHeight = this.calcGroupHeight(groupCapacity);
    let subQuestion: SubQuestion = { height: groupHeight, minHeight: groupHeight, markGroups: [] };
    let currentCapacity = 0;
    for (let i = 0; i !== allMarkGroups.length; i++) {
      if (currentCapacity + allMarkGroups[i].width < lineCapacity) {
        subQuestion.markGroups.push(allMarkGroups[i]);
        currentCapacity += allMarkGroups[i].width;
      } else {
        question.subQuestions.push(subQuestion);
        question.height += subQuestion.height;
        subQuestion = { height: groupHeight, minHeight: groupHeight, markGroups: [] };
        subQuestion.markGroups.push(allMarkGroups[i]);
        currentCapacity = allMarkGroups[i].width;
      }
    }
    question.subQuestions.push(subQuestion);
    question.height += subQuestion.height;
    question.minHeight = groupHeight + 1;
  }

  // 生成选择题每一列
  private generateAllMarkGroups(questionsContent, groupCapacity, judgementType: boolean): MarkGroup[] {
    const groupHeight = this.calcGroupHeight(groupCapacity);
    const allMarkGroups = [];
    let markGroup: MarkGroup = { width: 0, height: groupHeight, markSubQuestions: [] };
    for (let i = 0; i !== questionsContent.length; i++) {
      const markSubQuestion: MarkSubQuestion = {
        type: questionsContent[i].type,
        style: judgementType,
        optionCounts: questionsContent[i].options.length,
        index: questionsContent[i].index
      };
      markGroup.markSubQuestions.push(markSubQuestion);
      const markSubQuestionWidth = this.calcGroupWidth(markSubQuestion.optionCounts);
      markGroup.width = markGroup.width > markSubQuestionWidth ? markGroup.width : markSubQuestionWidth;
      // 若装满一道大题或容量已满，则换下一个markGroup
      if (this.breakPoints.indexOf(i + 1) !== -1 || markGroup.markSubQuestions.length === groupCapacity) {
        allMarkGroups.push(markGroup);
        markGroup =  { width: 0, height: groupHeight, markSubQuestions: [] };
      }
    }
    return allMarkGroups;
  }

  private generateChineseComposition(question: Question, questionsContent, isThreeCol: boolean): void {
    const defaultGridCount = 900;
    const lineCapacity = isThreeCol ? 14 : 22;
    const lineCount = Math.ceil(defaultGridCount / lineCapacity);
    const subQuestion: SubQuestion = {
      height: lineCount * 10 + 7,
      minHeight: 20,
      type: questionsContent[0].type,
      index: questionsContent[0].index,
      isFirstPart: true,
      gridCount: defaultGridCount,
      deltaCount: 0,
      content: [],
      partIndex: 1,
    };
    question.subQuestions.push(subQuestion);
    question.height += subQuestion.height;
    question.minHeight = subQuestion.minHeight + 6;
  }

  private generateEnglishComposition(question: Question, questionsContent): void {
    const defaultLineCount = 20;
    const subQuestion: SubQuestion = {
      height: defaultLineCount * 10 + 7,
      minHeight: 10,
      type: questionsContent[0].type,
      index: questionsContent[0].index,
      isFirstPart: true,
      lineCount: defaultLineCount,
      content: [],
      partIndex: 1,
    };
    question.subQuestions.push(subQuestion);
    question.height += subQuestion.height;
    question.minHeight = subQuestion.minHeight + 6;
  }

  // 生成非选择题
  private generateNonMarkSubQuestions(question: Question, questionsContent): void {
    for (let i = 0; i !== questionsContent.length; i++) {
      const subQuestion: SubQuestion = {
        height: questionsContent[i].type - 10000 > 6 ? 60 : 20,
        minHeight: 20,
        type: questionsContent[i].type,
        index: questionsContent[i].index,
        isFirstPart: true,
        content: [],
        partIndex: 1,
      };
      if (questionsContent[i].type === 10005 || questionsContent[i].type === 10006) {
        subQuestion.blankCount = questionsContent[i].answer.length;
        const extraHeight = Math.ceil(subQuestion.blankCount / 4) - 1;
        subQuestion.height += extraHeight * 10;
      }
      question.height += subQuestion.height;
      question.subQuestions.push(subQuestion);
    }
    question.minHeight = question.subQuestions[0].minHeight + 6;
  }

  private addEnglishCompositionQuestion(rawQuestion, question: Question): void {
    const subQuestion: SubQuestion = {
      height: rawQuestion.lineCount * 10 + 7,
      minHeight: 10,
      type: rawQuestion.type,
      index: rawQuestion.startIndex,
      isFirstPart: true,
      lineCount: rawQuestion.lineCount,
      content: [],
      partIndex: 1,
    };
    question.subQuestions.push(subQuestion);
    question.height += subQuestion.height;
    question.minHeight = subQuestion.minHeight + 6;
    this.questions.push(question);
  }

  private addChineseCompositionQuestion(rawQuestion, question: Question): void {
    const lineCapacity = rawQuestion.isThreeCol ? 14 : 22;
    const lineCount = Math.ceil(rawQuestion.gridCount / lineCapacity);
    const subQuestion: SubQuestion = {
      height: lineCount * 10 + 7,
      minHeight: 20,
      type: rawQuestion.type,
      index: rawQuestion.startIndex,
      isFirstPart: true,
      gridCount: rawQuestion.gridCount,
      deltaCount: 0,
      content: [],
      partIndex: 1,
    };
    question.subQuestions.push(subQuestion);
    question.height += subQuestion.height;
    question.minHeight = subQuestion.minHeight + 6;
    this.questions.push(question);
  }

  private addNonMarkQuestion(rawQuestion, question: Question): void {
    for (let i = rawQuestion.startIndex; i <= rawQuestion.endIndex; i++) {
      const subQuestion: SubQuestion = {
        height: rawQuestion.type === 10007 ? 60 : 20,
        minHeight: 20,
        type: rawQuestion.type,
        index: i,
        isFirstPart: true,
        content: [],
        partIndex: 1,
      };
      if (rawQuestion.type === 10005 || rawQuestion.type === 10006) {
        subQuestion.blankCount = rawQuestion.blankCount;
      }
      question.subQuestions.push(subQuestion);
      question.height += subQuestion.height;
    }
    question.minHeight = question.subQuestions[0].minHeight + 6;
    this.questions.push(question);
  }

  private generatePreQuestions(rawQuestion, question: Question): void {
    const markSubQuestions: any = [];
    for (let i = rawQuestion.startIndex; i <= rawQuestion.endIndex; i++) {
      const markSubQuestion: any = {};
      markSubQuestion.type = rawQuestion.type;
      markSubQuestion.options = [];
      for (let j = 0; j !== +rawQuestion.optionCount; j++) {
        markSubQuestion.options.push(0);
      }
      markSubQuestion.index = i;
      markSubQuestions.push(markSubQuestion);
    }
    question.isMark = true;
    const length = rawQuestion.endIndex - rawQuestion.startIndex + 1;
    if (this.preQuestions[0] && this.preQuestions[0].questionsContent) {
      if (this.breakPoints.length === 1) {
        this.renameMarkQuestion();
      }
      this.breakPoints.push(this.preQuestions[0].questionsContent.length + length);
      this.preQuestions[0].questionsContent = this.preQuestions[0].questionsContent.concat(markSubQuestions);
      const endIndexName = rawQuestion.startIndex === rawQuestion.endIndex ? '' : ('~' + rawQuestion.endIndex);
      this.preQuestions[0].name = this.preQuestions[0].name.replace(')',
        rawQuestion.startIndex + endIndexName + '为' + rawQuestion.title + ';)'
      );
    } else {
      this.breakPoints.push(length);
      this.preQuestions.push({
        name: question.title,
        questionsContent: markSubQuestions
      });
    }
    question.title = this.preQuestions[0].name;
  }

  private addMarkQuestion(rawQuestion, question: Question): void {
    this.generatePreQuestions(rawQuestion, question);
    this.generateMarkSubQuestions(rawQuestion.isThreeCol, rawQuestion.judgementType,
      rawQuestion.groupCapacity, question, this.preQuestions[0].questionsContent);
    // 保证选择题排在答题卡开头
    if (this.questions[0]) {
      if (this.questions[0].isMark) {
        this.questions[0] = question;
      } else {
        this.questions.unshift(question);
      }
    } else {
      this.questions.push(question);
    }
  }

  private appendName(rawQuestion: any): void {
    let endIndexName = '';
    if (rawQuestion.questionsContent.length !== 1) {
      endIndexName = '~' + rawQuestion.questionsContent[rawQuestion.questionsContent.length - 1].index;
    }
    this.preQuestions[0].name = this.preQuestions[0].name.replace(')',
      rawQuestion.questionsContent[0].index + endIndexName + '为' +
      rawQuestion.name + ';)'
    );
  }

  private renameMarkQuestion(): void {
    let endIndexName = '';
    if (this.preQuestions[0].questionsContent.length !== 1) {
      endIndexName = '~' + this.preQuestions[0].questionsContent[this.preQuestions[0].questionsContent.length - 1].index;
    }
    this.preQuestions[0].name = '选择题(' + this.preQuestions[0].questionsContent[0].index +
      endIndexName + '为' + this.preQuestions[0].name + ';)';
  }

  // 为每道小题添加题号
  private  addQuestionIndex(paperQuestionSetChapter): void {
    const rawQuestions = paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
    let questionIndex = 0;
    for (let i = 0; i !== rawQuestions.length; i++) {
      for (let j = 0; j !== rawQuestions[i].questionsContent.length; j++) {
        rawQuestions[i].questionsContent[j].index = ++questionIndex;
      }
    }
  }

  private addQuestionIndexToEnglishQuestions(paperQuestionSetChapter): void {
    const rawQuestions = paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
    let questionIndex = 0;
    for (let i = 0; i !== rawQuestions.length; i++) {
      for (let j = 0; j !== rawQuestions[i].questionsContent.length; j++) {
        // 如果是七选五、完型填空，则往深层小题添加题号
        if (rawQuestions[i].questionsContent[j].type === 10017 || rawQuestions[i].questionsContent[j].type === 10018) {
          const subQuestions = rawQuestions[i].questionsContent[j].questions;
          for (let l = 0; l !== subQuestions.length; l++) {
            subQuestions[l].index = ++ questionIndex;
          }
          continue;
        }
        // 其他材料题进一步判断最后一道小题，若为阅读理解或判断题则往深层小题添加题号
        if (rawQuestions[i].questionsContent[j].type > 10009) {
          const subQuestions = rawQuestions[i].questionsContent[j].questions;
          const lastSubQuestion = subQuestions[subQuestions.length - 1];
          // 如果是阅读理解或判断题
          if (lastSubQuestion.type === 10001 || lastSubQuestion.type === 10004) {
            for (let l = 0; l !== subQuestions.length; l++) {
              subQuestions[l].index = ++ questionIndex;
            }
            continue;
          }
        }
        // 其他题型照旧
        rawQuestions[i].questionsContent[j].index = ++questionIndex;
      }
    }
  }

  // 把所有选择题合并成第一大题
  private transferEnglishQuestions(paperQuestionSetChapter): void {
    const rawQuestions = paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
    for (let i = 0; i !== rawQuestions.length; i++) {
      // let readIndex = 0; // 阅读题编号
      for (let j = 0; j !== rawQuestions[i].questionsContent.length; j++) {
        // 如果是七选五、完型填空，则提取成大题
        if (rawQuestions[i].questionsContent[j].type === 10017 || rawQuestions[i].questionsContent[j].type === 10018) {
          rawQuestions[i].questionsContent = rawQuestions[i].questionsContent[j].questions;
          continue;
        }
        // 其他材料题进一步判断最后一道小题，若为阅读理解或判断题则提取成大题
        if (rawQuestions[i].questionsContent[j].type > 10009) {
          const subQuestions = rawQuestions[i].questionsContent[j].questions;
          const lastSubQuestion = subQuestions[subQuestions.length - 1];
          // 如果是阅读理解或判断题
          if (lastSubQuestion.type === 10001 || lastSubQuestion.type === 10004) {
            // 提取成大题
            const transferQuestion = {
              // name: lastSubQuestion.type === 10004 ? '判断题' : `阅读理解${++readIndex}`,
              name: '选择题',
              questionsContent: subQuestions
            };
            rawQuestions.splice(i++, 0, transferQuestion);
            rawQuestions[i].questionsContent.splice(j--, 1);
            // 若原大题已被掏空则删去
            if (rawQuestions[i].questionsContent.length === 0) {
              rawQuestions.splice(i--, 1);
            }
          }
          continue;
        }
      }
    }
  }

  private transferEnglishComposition(paperQuestionSetChapter): void {
    const rawQuestions = paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
    const compositions = [];
    // 遍历所有大题
    for (let i = 0; i !== rawQuestions.length; i++) {
      // 如果是选择题则跳到下一次循环，因为作文不可能在选择题里
      if (this.isMarkQuestion(rawQuestions[i].questionsContent[0].type)) {
        continue;
      }
      // 不是选择题则进一步检查每道小题
      const subQuestions = rawQuestions[i].questionsContent;
      for (let j = 0; j !== subQuestions.length; j++) {
        // 若某小题是作文则提取成大题
        if (subQuestions[j].writingType && subQuestions[j].writingType === 2) {
          const composition = {
            name: '作文',
            questionsContent: [ { type: 1, index: subQuestions[j].index } ]
          };
          compositions.push(composition);
          subQuestions.splice(j--, 1);
          // 若原大题已被掏空则删去
          if (subQuestions.length === 0) {
            rawQuestions.splice(i--, 1);
          }
        }
      }
    }
    paperQuestionSetChapter.questionSet.paperQuestionSetChapters = rawQuestions.concat(compositions);
  }

  // 把作文提取成大题
  private transferChineseQuestions(paperQuestionSetChapter): void {
    const rawQuestions = paperQuestionSetChapter.questionSet.paperQuestionSetChapters;
    const compositions = [];
    // 遍历所有大题
    for (let i = 0; i !== rawQuestions.length; i++) {
      // 如果是选择题则跳到下一次循环，因为作文不可能在选择题里
      if (this.isMarkQuestion(rawQuestions[i].questionsContent[0].type)) {
        continue;
      }
      // 不是选择题则进一步检查每道小题
      const subQuestions = rawQuestions[i].questionsContent;
      for (let j = 0; j !== subQuestions.length; j++) {
        // 若某小题是作文则提取成大题
        if (subQuestions[j].writingType && subQuestions[j].writingType === 1) {
          const composition = {
            name: '作文',
            questionsContent: [ { type: 0, index: subQuestions[j].index } ]
          };
          compositions.push(composition);
          subQuestions.splice(j--, 1);
          // 若原大题已被掏空则删去
          if (subQuestions.length === 0) {
            rawQuestions.splice(i--, 1);
          }
        }
      }
    }
    paperQuestionSetChapter.questionSet.paperQuestionSetChapters = rawQuestions.concat(compositions);
  }

  // 对原始数据进行预处理，把所有选择题合并为第一道大题
  private transferQuestions(paperQuestionSetChapter, paperCourseId: number): void {
    const rawQuestions = _.cloneDeep(paperQuestionSetChapter.questionSet.paperQuestionSetChapters);
    for (let i = 0; i !== rawQuestions.length; i++) {
      if (this.isMarkQuestion(rawQuestions[i].questionsContent[0].type)) {
        if (this.preQuestions[0]) {
          if (this.isMarkQuestion(this.preQuestions[0].questionsContent[0].type)) {
            // if (this.breakPoints.length === 1) { this.renameMarkQuestion(); }
            // if (this.breakPoints.length === 1) { this.preQuestions[0].name = '选择题'; }
            if (this.breakPoints.length === 1) {
              switch (paperCourseId) {
                case 15:
                case 32:
                case 44:
                case 55:
                case 72:
                  this.preQuestions[0].name = '选择题';
                  break;
                default:
                  this.renameMarkQuestion();
              }
            }
            this.breakPoints.push(rawQuestions[i].questionsContent.length + this.preQuestions[0].questionsContent.length);
            this.preQuestions[0].questionsContent = this.preQuestions[0].questionsContent.concat(rawQuestions[i].questionsContent);
            // this.appendName(rawQuestions[i]);
            switch (paperCourseId) {
              case 15:
              case 32:
              case 44:
              case 55:
              case 72:
                break;
              default:
                this.appendName(rawQuestions[i]);
            }
            continue;
          } else { // 若第一大题非选择题则把选择题插到数组头成为第一大题
            this.preQuestions.unshift(rawQuestions[i]);
            this.breakPoints.push(rawQuestions[i].questionsContent.length);
            continue;
          }
        }
        this.breakPoints.push(rawQuestions[i].questionsContent.length);
      }
      this.preQuestions.push(rawQuestions[i]);
    }
    paperQuestionSetChapter.questionSet.paperQuestionSetChapters = this.preQuestions;
  }

  setQuestions(questions: Question[]): void {
    this.questions = questions;
  }

  // 处理语文试卷
  setChineseQuestion(paperQuestionSetChapter, paperCourseId: number): void {
    this.addQuestionIndex(paperQuestionSetChapter);
    this.transferChineseQuestions(paperQuestionSetChapter);
    this.transferQuestions(paperQuestionSetChapter, paperCourseId);
  }

  // 处理英语试卷，把所有选择题合并为第一道大题
  setEnglishQuestion(paperQuestionSetChapter, paperCourseId: number): void {
    this.addQuestionIndexToEnglishQuestions(paperQuestionSetChapter);
    this.transferEnglishComposition(paperQuestionSetChapter);
    this.transferEnglishQuestions(paperQuestionSetChapter);
    this.transferQuestions(paperQuestionSetChapter, paperCourseId);
  }

  // 处理其他科目试卷，把所有选择题合并为第一道大题
  setOtherQuestion(paperQuestionSetChapter, paperCourseId: number): void {
    this.addQuestionIndex(paperQuestionSetChapter);
    this.transferQuestions(paperQuestionSetChapter, paperCourseId);
  }

  // 生成答题卡能识别的问题结构
  generateQuestions(isThreeCol: boolean, judgementType: boolean, groupCapacity): void {
    for (let i = 0; i !== this.preQuestions.length; i++) {
      const question: Question = { title: '', height: 6, minHeight: 257, isFirstPart: true, isMark: false, subQuestions: [] };
      question.title = this.preQuestions[i].name;
      question.isMark = this.isMarkQuestion(this.preQuestions[i].questionsContent[0].type);
      if (question.isMark) {
        this.generateMarkSubQuestions(isThreeCol, judgementType, groupCapacity, question, this.preQuestions[i].questionsContent);
      } else {
        if (this.preQuestions[i].questionsContent[0].type === 0) {
          this.generateChineseComposition(question, this.preQuestions[i].questionsContent, isThreeCol);
        } else if (this.preQuestions[i].questionsContent[0].type === 1) {
          this.generateEnglishComposition(question, this.preQuestions[i].questionsContent);
        } else {
          this.generateNonMarkSubQuestions(question, this.preQuestions[i].questionsContent);
        }
      }
      this.questions.push(question);
    }
  }

  // 获取处理完的数据
  getQuestions(): Question[] {
    return this.questions;
  }

  // 重新生成选择题
  regenerateMarkQuestion(isThreeCol: boolean, judgementType: boolean, groupCapacity: number): void {
    if (this.questions[0] && this.questions[0].isMark) {
      this.questions[0].height = 6;
      this.questions[0].minHeight = 257;
      this.questions[0].subQuestions = [];
      this.generateMarkSubQuestions(isThreeCol, judgementType, groupCapacity, this.questions[0], this.preQuestions[0].questionsContent);
    }
  }

  // 调整答题框高度
  resizeSubQuestion(params): void {
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].title === params.questionTitle) {
        for (let j = 0; j !== this.questions[i].subQuestions.length; j++) {
          if (this.questions[i].subQuestions[j].index === params.subQuestionIndex) {
            this.questions[i].subQuestions[j].height += params.deltaLength / 3.78;
            this.questions[i].height += params.deltaLength / 3.78;
            break;
          }
        }
        break;
      }
    }
  }

  // 添加新大题
  addQuestion(rawQuestion: any): void {
    const question: Question = { title: '', height: 6, minHeight: 257, isFirstPart: true, isMark: false, subQuestions: [] };
    question.title = rawQuestion.title;
    switch (rawQuestion.type) {
      case 10001:
      case 10002:
      case 10004:
        // 生成选择小题
        this.addMarkQuestion(rawQuestion, question);
        break;
      case 10005:
      case 10006:
      case 10007:
        // 生成填空、解答小题
        this.addNonMarkQuestion(rawQuestion, question);
        break;
      case 1:
        // 生成英语作文
        this.addEnglishCompositionQuestion(rawQuestion, question);
        break;
      case 0:
        // 生成语文作文
        this.addChineseCompositionQuestion(rawQuestion, question);
        break;
      default:
        alert('无效题型');
    }
  }

  addNonMarkSubQuestion(rawQuestion): void {
    let question;
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].title === rawQuestion.title) {
        question = this.questions[i];
        break;
      }
    }
    for (let i = rawQuestion.startIndex; i <= rawQuestion.endIndex; i++) {
      const subQuestion: SubQuestion = {
        height: rawQuestion.type === 10007 ? 60 : 20,
        minHeight: 20,
        type: rawQuestion.type,
        index: i,
        isFirstPart: true,
        content: [],
        partIndex: 1,
      };
      if (rawQuestion.type === 10005 || rawQuestion.type === 10006) {
        subQuestion.blankCount = rawQuestion.blankCount;
      }
      question.subQuestions.push(subQuestion);
      question.height += subQuestion.height;
    }
  }

  removeMarkQuestion(): void {
    this.questions.shift();
    this.preQuestions.shift();
    this.breakPoints = [];
  }

  removeSubQuestion(params): void {
    for (let j = 0; j !== this.questions.length; j++) {
      if (this.questions[j].title === params.questionTitle) {
        for (let i = 0; i !== this.questions[j].subQuestions.length; i++) {
          if (this.questions[j].subQuestions[i].index === params.subQuestionIndex) {
            this.questions[j].height -= this.questions[j].subQuestions[i].height;
            this.questions[j].subQuestions.splice(i, 1);
            break;
          }
        }
        // 若该大题已不包含任何小题则顺便删除该大题
        if (this.questions[j].subQuestions.length === 0) {
          this.questions.splice(j, 1);
        }
        break;
      }
    }
  }

  resetChineseComposition(title: string, count: number, isThreeCol: boolean): void {
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].title === title) {
        this.questions[i].subQuestions[0].gridCount = count;
        const lineCapacity = isThreeCol ? 14 : 22;
        const lineCount = Math.ceil(count / lineCapacity);
        this.questions[i].subQuestions[0].height = lineCount * 10 + 7;
        this.questions[i].height = this.questions[i].subQuestions[0].height + 6;
        break;
      }
    }
  }

  regenerateChineseComposition(isThreeCol: boolean): void {
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].subQuestions[0].type === 0) {
        const lineCapacity = isThreeCol ? 14 : 22;
        const lineCount = Math.ceil(this.questions[i].subQuestions[0].gridCount / lineCapacity);
        this.questions[i].subQuestions[0].height = lineCount * 10 + 7;
        this.questions[i].height = this.questions[i].subQuestions[0].height + 6;
        break;
      }
    }
  }

  resetEnglishComposition(title: string, count: number): void {
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].title === title) {
        this.questions[i].subQuestions[0].lineCount = count;
        this.questions[i].subQuestions[0].height = count * 10 + 7;
        this.questions[i].height = this.questions[i].subQuestions[0].height + 6;
        break;
      }
    }
  }

  saveContent(questionTitle: string, subQuestionIndex: number, innerHtml: string, height: number, partIndex: number): void {
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].title === questionTitle) {
        const subQuestions = this.questions[i].subQuestions;
        for (let j = 0; j !== subQuestions.length; j++) {
          if (subQuestions[j].index === subQuestionIndex) {
            const content = { innerHtml: innerHtml, height: height, partIndex: partIndex };
            if (subQuestions[j].content.length === 0) {
              subQuestions[j].content.unshift({ innerHtml: '', height: 0 });
              subQuestions[j].content.push({ innerHtml: '', height: 0 });
            }
            let found = false;
            for (let contentIndex = 0; contentIndex !== subQuestions[j].content.length; contentIndex++) {
              if (subQuestions[j].content[contentIndex].partIndex === partIndex) {
                subQuestions[j].content[contentIndex] = content;
                found = true;
                break;
              }
            }
            if (!found) {
              subQuestions[j].content.splice(subQuestions[j].content.length - 1, 0, content);
            }
            break;
          }
        }
        break;
      }
    }
  }

  renameQuestion(oldTitle, newTitle): void {
    for (let i = 0; i !== this.questions.length; i++) {
      if (this.questions[i].title === oldTitle) {
        this.questions[i].title = newTitle;
        break;
      }
    }
  }

  getPreQuestions(): any {
    return this.preQuestions;
  }

  setPreQuestions(preQuestions): void {
    this.preQuestions = preQuestions;
  }

  getBreakPoints(): any[] {
    return this.breakPoints;
  }

  setBreakPoints(breakPoints): void {
    this.breakPoints = breakPoints;
  }
}
