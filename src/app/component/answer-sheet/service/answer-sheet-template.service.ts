import { Injectable } from '@angular/core';

import { AnswerSheet } from '../data/answerSheet';
import { AnswerSheetOption } from '../data/answerSheetOption';

@Injectable({
  providedIn: 'root'
})
export class AnswerSheetTemplateService {

  // 魔法数字
  // 第一页减去考生信息后的容量(mm)
  private Capacity_FirstPage_Number = 169;
  private Capacity_FirstPage_BarCode = 186;
  // 考生信息对应禁区高度(mm)
  private NoAnswerHeight_Number = 70;
  private NoAnswerHeight_BarCode = 54;
  // 主体区域宽度(mm)
  private MainWidth_OneCol = 180;
  private MainWidth_TwoCol = 180;
  private MainWidth_ThreeCol_Narrow = 118;
  private MainWidth_ThreeCol_Wide = 136;
  // 主体区域距纸张左边界的距离(mm)
  private MainLeft_OneCol = 15;
  private MainLeft_TwoCol = 15;
  private MainLeft_ThreeCol_Left = 20;
  private MainLeft_ThreeCol_Middle = 2;
  private MainLeft_ThreeCol_Right = 2;
  // 主体区域容纳答题框的竖直容量(mm)
  private Capacity_OneCol_FirstPage = this.Capacity_FirstPage_Number;
  private Capacity_OneCol_LastPage = 240;
  private Capacity_TwoCol_FirstPage = this.Capacity_FirstPage_Number;
  private Capacity_TwoCol_OtherPage = 257;
  private Capacity_TwoCol_LastPage = 240;
  private Capacity_ThreeCol_FirstPage = this.Capacity_FirstPage_Number;
  private Capacity_ThreeCol_OtherPage = 257;
  private Capacity_ThreeCol_LastPage = 240;

  private astOneCol: AnswerSheet[] = [
    {
      mainWidth: this.MainWidth_OneCol,
      mainLeft: this.MainLeft_OneCol,
      isThreeCol: false,
      isFirstPage: true,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: true,
      isRightBorder: true,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_OneCol_FirstPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_OneCol,
      mainLeft: this.MainLeft_OneCol,
      isThreeCol: false,
      isFirstPage: false,
      isDangerZone: true,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: this.NoAnswerHeight_Number,
      isLeftBorder: true,
      isRightBorder: true,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_OneCol_LastPage,
      questions: []
    }
  ];

  private astTwoCol: AnswerSheet[] = [
    {
      mainWidth: this.MainWidth_TwoCol,
      mainLeft: this.MainLeft_TwoCol,
      isThreeCol: false,
      isFirstPage: true,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: true,
      isRightBorder: false,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_TwoCol_FirstPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_TwoCol,
      mainLeft: this.MainLeft_TwoCol,
      isThreeCol: false,
      isFirstPage: false,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: false,
      isRightBorder: true,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_TwoCol_OtherPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_TwoCol,
      mainLeft: this.MainLeft_TwoCol,
      isThreeCol: false,
      isFirstPage: false,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: true,
      isRightBorder: false,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_TwoCol_OtherPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_TwoCol,
      mainLeft: this.MainLeft_TwoCol,
      isThreeCol: false,
      isFirstPage: false,
      isDangerZone: true,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: this.NoAnswerHeight_Number,
      isLeftBorder: false,
      isRightBorder: true,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_TwoCol_LastPage,
      questions: []
    }
  ];

  private astThreeCol: AnswerSheet[] = [
    {
      mainWidth: this.MainWidth_ThreeCol_Narrow,
      mainLeft: this.MainLeft_ThreeCol_Left,
      isThreeCol: true,
      isFirstPage: true,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: true,
      isRightBorder: false,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_ThreeCol_FirstPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_ThreeCol_Wide,
      mainLeft: this.MainLeft_ThreeCol_Middle,
      isThreeCol: true,
      isFirstPage: false,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: false,
      isRightBorder: false,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_ThreeCol_OtherPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_ThreeCol_Narrow,
      mainLeft: this.MainLeft_ThreeCol_Right,
      isThreeCol: true,
      isFirstPage: false,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: false,
      isRightBorder: true,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_ThreeCol_OtherPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_ThreeCol_Narrow,
      mainLeft: this.MainLeft_ThreeCol_Left,
      isThreeCol: true,
      isFirstPage: false,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: true,
      isRightBorder: false,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_ThreeCol_OtherPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_ThreeCol_Wide,
      mainLeft: this.MainLeft_ThreeCol_Middle,
      isThreeCol: true,
      isFirstPage: false,
      isDangerZone: false,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: 0,
      isLeftBorder: false,
      isRightBorder: false,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_ThreeCol_OtherPage,
      questions: []
    },
    {
      mainWidth: this.MainWidth_ThreeCol_Narrow,
      mainLeft: this.MainLeft_ThreeCol_Right,
      isThreeCol: true,
      isFirstPage: false,
      isDangerZone: true,
      isSetNoAnswerArea: false,
      noAnswerAreaHeight: this.NoAnswerHeight_Number,
      isLeftBorder: false,
      isRightBorder: true,
      pageIndex: 0,
      candidateNumberType: true,
      capacity: this.Capacity_ThreeCol_LastPage,
      questions: []
    }
  ];

  constructor() { }

  getAnswerSheetTemplate(answerSheetOption: AnswerSheetOption): AnswerSheet[] {
    let result: AnswerSheet[] = [];
    switch (answerSheetOption.col) {
      case 1:
        result = JSON.parse(JSON.stringify(this.astOneCol));
        break;
      case 2:
        result = JSON.parse(JSON.stringify(this.astTwoCol));
        break;
      case 3:
        result = JSON.parse(JSON.stringify(this.astThreeCol));
        break;
    }
    // 修改考号版式
    if (!answerSheetOption.candidateNumberType) {
      result[0].capacity = this.Capacity_FirstPage_BarCode;
      result[result.length - 1].noAnswerAreaHeight = this.NoAnswerHeight_BarCode;
      for (let i = 0; i !== result.length; i++) {
        result[i].candidateNumberType = false;
      }
    }
    // 设置禁区
    if (answerSheetOption.noAnswerZone) {
      const capacity = result[result.length - 1].candidateNumberType ? this.Capacity_FirstPage_Number : this.Capacity_FirstPage_BarCode;
      result[result.length - 1].capacity = capacity;
      const height = result[result.length - 1].candidateNumberType ? this.NoAnswerHeight_Number : this.NoAnswerHeight_BarCode;
      result[result.length - 1].noAnswerAreaHeight = height;
      for (let i = 0; i !== result.length; i++) {
        result[i].isSetNoAnswerArea = true;
      }
    }
    return result;
  }
}
