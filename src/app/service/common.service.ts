import { Injectable, Renderer2 } from '@angular/core';
import { PaperQuestionSetChapter } from '../component/details/paper-details/data/paperDetailsResponse';
import { Utils } from '../utils';

@Injectable()
export class CommonService {

  renderer: Renderer2;

  constructor(
    private utils: Utils
    ) { }

  dealData(paperQuestionSetChapters: PaperQuestionSetChapter[]): PaperQuestionSetChapter[] {
    let count = 1;
    paperQuestionSetChapters.forEach((item, index) => {
      const questionsContent = item.questionsContent;
      if (questionsContent && questionsContent.length > 0) {
        item.isWithResource = true;
        questionsContent.forEach((question, questionIndex) => {
          // 为题目添加序号
          question.number = count;
          question.content = this.utils.getQuestionSerialNumber(question, count++, 0);
          // 将带有 tex 标签替换为 img
          if (question.options) question.content = this.utils.dealStr(question.content,true);
          else question.content = this.utils.dealStr(question.content,false);

          if (question.solution) {
            question.solution = this.utils.dealStr(question.solution,false);
          }

          if (question.options) {
            question.options.forEach((option, optionIndex) => {
              // 为选项添加序号（A、B、C、D）
              question.options[optionIndex] = this.utils.getOptionSerialNumber(option, optionIndex);
              question.options[optionIndex] = this.utils.dealStr(question.options[optionIndex],false);
            });
          }

          if (question.questions && question.questions.length > 0) {
            // let subCount = 1;
            question.questions.forEach((subQuestion, subQuestionIndex) => {

              if (subQuestion.options) subQuestion.content = this.utils.dealStr(subQuestion.content,true);
              else subQuestion.content = this.utils.dealStr(subQuestion.content,false);

              subQuestion.solution = this.utils.dealStr(subQuestion.solution,false);

              if (question.questions.length === 1) {
                subQuestion.content = this.utils.getQuestionSerialNumber(subQuestion, subQuestionIndex + 1, 0);
              } else {
                subQuestion.content = this.utils.getQuestionSerialNumber(subQuestion, subQuestionIndex + 1, 1);
              }

              if (subQuestion.options) {
                // 小题中是客观题的添加序号
                subQuestion.options.forEach((subQuestionOption, subQuestionOptionIndex) => {
                  // tslint:disable-next-line:max-line-length
                  subQuestion.options[subQuestionOptionIndex] = this.utils.getOptionSerialNumber(subQuestionOption, subQuestionOptionIndex);
                  subQuestion.options[subQuestionOptionIndex] = this.utils.dealStr(subQuestion.options[subQuestionOptionIndex],false);
                });
              }
              // } else {
              //   subQuestion.content = this.utils.getQuestionSerialNumber(subQuestion, subCount++, 1);
              //}
            });
          }
        });
      } else {
        item.isWithResource = false;
      }
    });

    return paperQuestionSetChapters;
  }

  getQuestionTotalCount(paperQuestionSetChapters: PaperQuestionSetChapter[]): number {
    let count = 0;
    paperQuestionSetChapters.forEach((item, index) => {
      count += item.questionCount;
    });
    return count;
  }

  getQuestionTotalScore(paperQuestionSetChapters: PaperQuestionSetChapter[]): number {
    let score = 0;
    paperQuestionSetChapters.forEach((item, index) => {
      item.questionsContent.forEach((question, questionIndex) => {
        score += question.score;
      });
    });
    return score;
  }

  /**
   * 点击题目进行锚点定位
   * @param targetDom             需要定位的目标Dom元素
   * @param scrollElementRef      滑动区域
   * @param SCROLL_OFFSET         需定位的位置在滑动区域中的距离
   * @param ANCHOR_RATE           自动滑动速度，数值越小速度越快
   * @param isPreview             来自试卷预览的特殊处理 默认 false
   */
  handleAnchor(targetDom: any, scrollElementRef: any, SCROLL_OFFSET: number, ANCHOR_RATE: number, isPreview = false): void {
    let currentAnchor = scrollElementRef.scrollTop;
    let questionTop = this.getElementTop(targetDom);
    let scrollWrapTop = this.getElementTop(scrollElementRef);
    let actualTop = questionTop - scrollWrapTop - SCROLL_OFFSET;  // 目标高度
    if (isPreview) {
      actualTop -= 45;  // 去掉解析栏的高度
    }
    const anchorRate = (Math.abs(actualTop - currentAnchor)) / ANCHOR_RATE;
    // 兼容其他浏览器
    if (window.scrollTo) {
      scrollElementRef.scrollTo({"behavior": "smooth", "top": actualTop})
    } else {
      const interval = setInterval(() => {
        if (currentAnchor < actualTop) {
          scrollElementRef.scrollTop = currentAnchor += anchorRate;
        } else {
          scrollElementRef.scrollTop = currentAnchor -= anchorRate;
        }
        if (currentAnchor <= actualTop + anchorRate && currentAnchor >= actualTop - anchorRate) {
          clearInterval(interval);
          scrollElementRef.scrollTop = actualTop;
        }
      }, 10);
    }
  }

  /**
   * 获取某元素到浏览器最左边的距离
   * @param element     需要获取的元素
   */
  getElementLeft(element) {
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent;
    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    return actualLeft;
  }

  /**
   * 获取某元素到浏览器最上边的距离
   * @param element     需要获取的元素
   */
  getElementTop(element) {
    let actualTop = element.offsetTop;
    let current = element.offsetParent;
    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }
    return actualTop;
  }
}
