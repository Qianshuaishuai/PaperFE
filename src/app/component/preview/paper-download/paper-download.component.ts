import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyService } from '../../../service/property.service';

import * as htmlDocx from '../../../../../node_modules/html-docx-js/dist/html-docx.js';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-paper-download',
  templateUrl: './paper-download.component.html',
  styleUrls: ['./paper-download.component.scss']
})
export class PaperDownloadComponent implements OnInit {

  @Input() entryType: number;
  @Output() isCloseDownloadPaper = new EventEmitter<boolean>();
  @Output() showPrintPaper = new EventEmitter<boolean>();
  @Output() showSolution = new EventEmitter<boolean>();

  private courseId: number;

  selectedFile = 1;
  selectedSize = 1;
  selectType = 1;

  state = false;

  constructor(
    private router: Router,
    private propertyService: PropertyService,
  ) { }

  ngOnInit() {
    this.courseId = this.propertyService.readOldSubjectId();
  }

  private convertImgToBase64 (afterConvert) {
    const that = this;
    const allImages = [].concat(document.querySelectorAll('#paperContent img'))[0]; // 这样做是为了绕开ts的检查
    const nonBase64Images = [];
    for (let i = 0; i !== allImages.length; i++) {
      if (allImages[i].src.indexOf('base64,') === -1) {
        nonBase64Images.push(allImages[i]);
      }
    }
    if (nonBase64Images.length === 0) {
      this.state = false;
      afterConvert.call(that);
    } else {
      const totalCount = nonBase64Images.length;
      let loadedCount = 0;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      [].forEach.call(nonBase64Images, function (imgElement) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        const intervalId = window.setInterval(function() {
          if (imgElement.width && imgElement.height) {
            window.clearInterval(intervalId);
            image.width = +imgElement.getAttribute('width') ? +imgElement.getAttribute('width') : imgElement.width;
            image.height = +imgElement.getAttribute('height') ? +imgElement.getAttribute('height') : imgElement.height;
            image.src = imgElement.src;
            image.onload = () => {
              canvas.width = image.width;
              canvas.height = image.height;
              ctx.drawImage(image, 0, 0);
              const dataURL = canvas.toDataURL();
              imgElement.setAttribute('src', dataURL);
              loadedCount++;
              if (loadedCount === totalCount) {
                that.state = false;
                afterConvert.call(that);
              }
            };
          }
        });
      }, 10);
      canvas.remove();
      this.state = true;
    }
  }

  private getPaperStyleHTMLString(): string {
    // +++++++ 试卷样式定制 +++++++
    const styles = `<style>
      .pane { float: left; width: 100px; height: 573px; padding: 20px 10px 0 25px; }
      .paper-title { font-size: 21px; font-weight: bold; min-height: 40px; line-height: 40px; text-align: center; }
      .paper-marking { font-size: 14px; font-weight: bold; color: #333; padding-left: 20px; line-height: 30px; }
      .subtitle { margin-top: 5px; min-height: 30px; line-height: 30px; font-size: 20px; text-align: center; }
      .paper-info, .student-info { margin-top: 5px; text-align: center; font-size: 14px; color: #333; min-height: 24px; line-height: 24px;}
      .count-box { margin-top: 15px; }
      .count-box table { width: 100%; font-size:14px; margin: auto; border-collapse: collapse; border-spacing: 0; }
      .count-box td { text-align: center; border: 1px solid #333; }
      .paper-notice { margin: 20px 0 10px; font-size: 14px; color: #333; }
      .paper-volum-a { min-height: 40px; line-height: 40px; text-align: center; margin: 5px 0; font-size: 16px; }
      body { font-size: 14px; }
      .question-number { float: left; line-height: 23px; color: #3357FF; }
      .boldElement { color: #3357ff;}
      </style>`;
    return styles;
  }

  private getPaperHeaderHTMLString(): string {
    // 评分栏
    const counts = document.getElementsByClassName('counts');
    const count = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五'];
    let tdTarget = '';
    let tdTarget1 = '';
    const time = document.getElementById('time');
    for ( let index = 0; index <= counts.length; index++) {
      tdTarget += '<td>' + count[index] + '</td>';
      tdTarget1 += '<td></td>';
    }

    const title = document.getElementById('mainTitle').innerText;
    if (this.selectType === 4) {
      return `<div class="paper-title">${title}</div><div class="subtitle">答案和解析</div>`;
    }
    if (time) {
      return `
        <div class="paper-marking">绝密★启用前</div>
        <div class="paper-title">${title}</div>
        <div class="subtitle">副标题</div>
        <div class="paper-info">考试范围：xxx；考试时间：100分钟；命题人：xxx</div>
        <div class="student-info">学校:___________姓名：___________班级：___________考号：___________</div>
        <div class="paper-notice">
          <div class="count-box">
            <table>
              <tbody><tr><td>题号</td>${tdTarget}<td>总分</td></tr><tr><td>得分</td>${tdTarget1}<td></td></tr></tbody>
            </table>
          </div>
          <p>注意：本试卷包含Ⅰ、Ⅱ两卷。第Ⅰ卷为选择题，所有答案必须用2B铅笔涂在答题卡中相应的位置。第Ⅱ卷为非选择题，所有答案必须填在答题卷的相应位置。答案写在试卷上均无效，不予记分。</p>
        </div>
      `;
    }
  }

  private generatePaperHTMLString(contentString): string {
    const styleTagInnerHtml = this.getPaperStyleHTMLString();
    const header = this.getPaperHeaderHTMLString();
    let content;
    if (header) {
      content = `<!DOCTYPE html><html>
        <head>${styleTagInnerHtml}</head>
        <body><div>${header} ${contentString}</div>`;
    } else {
      content = `<!DOCTYPE html><html>
        <head>${styleTagInnerHtml}</head>
        <body><div>${contentString}</div>`;
    }
    return content;
  }

  private splitHeader(printArea): void {
    // +++++++ 标题断行处理 +++++++++
    // 0. 获取题号
    // 1. 遍历要修改的节点,依次添加题号
    // 2. 删除原有题号
    const childs = printArea.getElementsByClassName('question-number');
    const changeNode = printArea.getElementsByClassName('question-content');
    const removeChild = printArea.getElementsByClassName('question-item-content');
    let questionNumber;
    for (let i = 0; i < childs.length; i++) {
      questionNumber = childs[i].innerHTML;
      const node = document.createTextNode(questionNumber);
      changeNode[i].firstChild.insertBefore(node, changeNode[i].firstChild.childNodes[0]);
    }
    for (let j = 0; j < removeChild.length; j++) {
      removeChild[j].removeChild(removeChild[j].childNodes[0]);
    }
  }

  private removeSolution(printArea): void {
    const answer = printArea.getElementsByClassName('pre-solution');
    for (let answerIndex = 0; answerIndex < answer.length; answerIndex++) {
      answer[answerIndex].removeChild(answer[answerIndex].childNodes[0]);
    }
  }

  private extractSolution(printArea): string {
    /* 前提：答案和解析已挂载到DOMTree */
    const allSolution = printArea.querySelectorAll('.pre-solution');
    let solutionString = '';
    // 在printArea中提取所有答案和解析，合并成新的HTML字符串
    for (let i = 0; i !== allSolution.length; i++) {
      printArea.innerHTML = printArea.innerHTML.replace(allSolution[i].innerHTML, '');
      solutionString += `<div class="boldElement">${i + 1}. </div>` + allSolution[i].innerHTML;
    }
    // 去除多余的字符
    printArea.innerHTML = printArea.innerHTML.replace(/解析/g, '');
    // 对答案和解析排好序后插入到printArea末尾
    const allAnswer = document.querySelectorAll('[data-solution-type=answer]');
    let answerString = '';
    for (let i = 0; i !== allAnswer.length; i++) {
      solutionString = solutionString.replace(allAnswer[i].outerHTML, '');
      // 题目与题号断行处理
      const answerOrder = allAnswer[i].childNodes[2];
      if (answerOrder.childNodes.length === 1) {
        // 区分是否是选择题
        if (answerOrder.childNodes[0].nodeName === '#text') {
          if (answerOrder.textContent.match(/\d/)) {
            answerString +=  allAnswer[i].outerHTML;
          } else {
            answerOrder.textContent = `${i + 1}. ` + answerOrder.textContent;
            answerString += allAnswer[i].outerHTML;
          }
        } else {
          answerString += `<div>${i + 1}. </div>` + allAnswer[i].outerHTML;
        }
      } else {
        answerString += `<div>${i + 1}. </div>` + allAnswer[i].outerHTML;
      }
    }
    // 去除多余的字符
    solutionString = solutionString.replace(/【解析】/g, '');
    solutionString = solutionString.replace(/\<br\s_ngcontent-c\d+=""\>/g, '');
    answerString = answerString.replace(/【答案】/g, '');
    answerString = answerString.replace(/\<br\s_ngcontent-c\d+=""\>/g, '');

    // 若没有解析则返回无
    if (document.querySelectorAll('[data-solution-type=solution]').length === 0) {
      solutionString = '无';
    }
    return '<h4 class="boldElement">【答案】</h4>' + answerString + '<h4 class="boldElement">【解析】</h4>' + solutionString;
  }

  private formatHTMLString(printArea): void {
    //  +++++++ 组卷页,删除question-tip  +++++++
    const allQuestionTip = document.querySelectorAll('.question-tip');
    for (let i = 0; i !== allQuestionTip.length; i++) {
      printArea.innerHTML = printArea.innerHTML.replace(allQuestionTip[i].outerHTML, '');
    }

    // +++++++ 多余字符处理 +++++++
    printArea.innerHTML = printArea.innerHTML.replace(/正在加载中\.\.\./g, '');
    /*
    const str = [/正在加载中\.\.\./g, /解析/g, /纠错/g, /插入试题/g, /收起/g, /&nbsp;/g];
    str.forEach(function (i) {
      printArea.innerHTML = printArea.innerHTML.replace(i, '');
    });
    */

    // 去除小学数据中的假括号
    const blankSpan = printArea.querySelectorAll('[type="none"]');
    for (let i = 0; i !== blankSpan.length; i++) {
      printArea.innerHTML = printArea.innerHTML.replace(blankSpan[i].outerHTML, '  ');
    }

    // 把自定义的pos标签替换成能打印的
    printArea.innerHTML = printArea.innerHTML.replace(/\<pos.*?pos\>/g, '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>');
  }

  private generateOutputName(): string {
    let outputName = document.getElementById('mainTitle').innerText;
    switch (this.selectType) {
      case 1:
        outputName += '-学生用卷';
        break;
      case 2:
        outputName += '-教师用卷';
        break;
      case 3:
        outputName += '-普通用卷';
        break;
      case 4:
        outputName += '-纯答案';
        break;
      default:
        // 潜在的错误处理
    }
    return outputName;
  }

  private generateHTMLString(): string {
    let printArea;
    printArea = document.getElementById('paperContent').cloneNode(true);
    // 图片处理
    const  questionContent = printArea.getElementsByClassName('question-content');
    for (let index = 0; index < questionContent.length; index++) {
      const pTarget = questionContent[index].getElementsByTagName('p');
      for (let pIndex = 0; pIndex <= pTarget.length; pIndex++) {
        if (pTarget[pIndex]) {
          const imgTarget = pTarget[pIndex].getElementsByTagName('img');
          for (let imgIndex = 0; imgIndex <= imgTarget.length; imgIndex++) {
            if (imgTarget[imgIndex]) {
              if (imgTarget[imgIndex].width > 500) {
                imgTarget[imgIndex].setAttribute('width', '600');
                imgTarget[imgIndex].style.maxWidth = '600px';
              }
            }
          }
        }
      }
    }

    this.splitHeader(printArea);
    this.formatHTMLString(printArea);

    // choose a save area
    switch (this.selectType) {
      case 1:
        this.removeSolution(printArea);
        break;
      case 2:
        break;
      case 3:
        const solutionString = this.extractSolution(printArea);
        printArea.innerHTML += solutionString;
        break;
      case 4:
        printArea.innerHTML = this.extractSolution(printArea);
        break;
      default:
        // 潜在的错误处理
    }
    return printArea.outerHTML;
  }

  private downloadDocx(printAreaString: string, outputName: string) {
    const content = this.generatePaperHTMLString(printAreaString);
    // +++++++ html 转 word +++++++
    const converted = htmlDocx.asBlob(content);
    saveAs(converted, outputName + '.docx');
  }

  private downloadDoc(printAreaString: string, outputName: string) {
    const content = this.generatePaperHTMLString(printAreaString);
    // +++++++ html 转 word +++++++
    const converted = htmlDocx.asBlob(content);
    saveAs(converted, outputName + '.doc');
  }

  private downloadFile() {
    const printAreaString = this.generateHTMLString();
    const outputName = this.generateOutputName();
    // choose a file format
    switch (this.selectedFile) {
      case 1:
        this.downloadDocx(printAreaString, outputName);
        break;
      case 2:
        this.downloadDoc(printAreaString, outputName);
        break;
      default:
        // 潜在的错误处理
    }
  }

  private paperPrint() {
    const printAreaString = this.generateHTMLString();
    const content = this.generatePaperHTMLString(printAreaString);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(content);
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  }

  public downloadPaper(): void {
    this.convertImgToBase64(this.downloadFile);
    this.showSolution.emit(true);
  }

  public printPaper(): void {
    this.convertImgToBase64(this.paperPrint);
    this.showSolution.emit(true);
  }

  public return(): void {
    if (this.entryType === 1) {
      this.closeDownload();
    } else {
      this.propertyService.writeSubjectId(this.courseId);
      this.router.navigate([`/library/${this.courseId}/100/-1/0`]);
    }
  }

  public closeDownload(): void {
    this.isCloseDownloadPaper.emit(false);
  }

  public selectPaperType(paperType: number): void {
    this.selectType = paperType;
  }

  public selectedPageSize(pageSize: number): void {
    this.selectedSize = pageSize;
  }

  public selectedFileFormat(fileType: number): void {
    this.selectedFile = fileType;
  }

}
