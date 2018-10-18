import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { Question } from '../../details/paper-details/data/paperDetailsResponse';
import { MessageService } from '../../../service/message.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-blank-question',
  templateUrl: './blank-question.component.html',
  styleUrls: ['./blank-question.component.scss']
})

export class BlankQuestionComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  question: Question;

  @Input()
  index: number;

  element: HTMLElement;

  multiCutFlag = false; // 选择多个空格删除的标志位
  multiOriginSet: string[] = []; // 记录增删前的空格序列集合
  countValue = 0;
  lineType = 'pos'; // pos标签定义参见styles.css
  lineText = `&nbsp;<pos onclick="document.getElementById(this.id.replace('line', 'answer'))"
                      contenteditable="false"></pos>&nbsp;`;

  ansTip = '请输入选项内容'; // 请输入参考答案内容
  editorKeys = [];
  preOffset: number;
  currentOffset: number;
  firstOffset: number;

  constructor(
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (_.isArray(this.question.answer)) {
      this.question.answer.forEach(answer => {
        answer = answer.replace(/\<p\>(.*?)\<\/p\>/g, ($0, $1, $2) => {
          const result = $1;
          return result;
        });
      });
    }
    if (!_.isArray(this.question.answer)) {
      const arr = this.question.answer;
      this.question.answer = [];
      this.question.answer = [...arr];
    }
    if (_.isString(this.question.answer)) {
      this.question.answer = [];
    }
  }

  ngAfterViewInit() {
    this.initBlankQuestion();
    try {
      CKEDITOR.inline(`edit-question-title-${this.index}`);
    } catch (error) {

    }
  }

  private initBlankQuestion() {
    this.element = document.getElementById('edit-question-title-' + this.index);

    if (this.question.type === 10006) {
      this.ansTip = '请输入选项参考答案内容';
    }
    if (this.question.content) {
      // this.question.options = undefined; // 直接移除该字段
      let temp = this.question.content.replace(/(\<p\>)/g, ''); // 替换ｐ标签，利用br来换行
      // temp = temp.replace(/(__\$\$__)+/g, '&nbsp;<pos contenteditable="false"></pos>&nbsp;');
      temp = temp.replace(/(<\/p>)/g, '<br/>');
      this.question.content = temp.replace(/\<br\/\>$/, '');
      this.question.content = this.question.content.replace(/\<p\>([\s\S]*)\<\/p\>/i, ($0, $1, $2) => {
        const result = $1;
        return result;
      });
      this.question.content = this.question.content.replace(/\<span style="margin-left: 20px;" id="(.*?)"\>\<\/span\>/, '');
      this.question.content = this.question.content.replace(/\<p\>\<\/p\>/g, '');
      this.element.innerHTML = this.question.content.replace(/\$\$/g, '');
    }

    setTimeout(() => {
      if (this.question.content) {
        if (!this.question.blank) {
          this.question.blank = this.question.answer.length;
        }
        const itemElements = this.element.getElementsByTagName(this.lineType);
        if (!itemElements.length) {
          return;
        }
        this.multiOriginSet = [];
        for (let i = 0; i < this.question.blank; i++) {
          if (!itemElements[i]) {
            continue;
          }
          itemElements[i].id = 'edit-question-line-' + this.index + '-' + i;
          itemElements[i].innerHTML = '' + (i + 1);
          itemElements[i].setAttribute('countValue', '' + this.countValue);
          this.multiOriginSet[this.multiOriginSet.length] = itemElements[i].id;
        }
        // console.log('setTimeout2 this.multiOriginSet=' + this.multiOriginSet.length);
        // console.log('setTimeout2 this.lineCount=' + this.question.blank);
        this.countValue++;
      }
      // this.element.appendChild(document.createElement('br'));
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {}

  getTrackBy(i: number, obj: any) {
    return i;
  }

  hasContentInput(): boolean {
    if (this.question.content && this.question.content !== '<br>') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 点击增加空格线
   */
  insertBlank() {
    if (_.isArray(this.question.answer) && this.question.answer.length >= 20) {
      return;
    }

    if (window.getSelection) {
      // console.log('insertBlank() step-2');
      this.element.focus();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0); // 暂不考虑多个选取片段
      range.deleteContents(); // 删除选取的片段内容
      range.collapse(false);

      const hasR = range.createContextualFragment(this.lineText);
      let hasR_lastChild = hasR.lastChild;
      while (hasR_lastChild && hasR_lastChild.nodeName.toLowerCase() === 'br' &&
        hasR_lastChild.previousSibling &&
        hasR_lastChild.previousSibling.nodeName.toLowerCase() === 'br') {
        const e = hasR_lastChild;
        hasR_lastChild = hasR_lastChild.previousSibling;
        hasR.removeChild(e);
      }
      range.insertNode(hasR);
      if (hasR_lastChild) {
        range.setEndAfter(hasR_lastChild);
        range.setStartAfter(hasR_lastChild);
      }
      selection.removeAllRanges();
      selection.addRange(range);
      // this.preOffset = selection.focusOffset;
      // if (this.preOffset === selection.focusOffset) {
      //   if (this.firstOffset !== this.preOffset) {
      //     this.firstOffset = this.preOffset;
      //     this.currentOffset = this.firstOffset;
      //   }
      //   this.currentOffset += 3;
      //   // const focusOffset = this.currentOffset - 3 - ((this.currentOffset - 3) % 3);
      //   const focusOffset = this.currentOffset - 3;
      //   console.log(this.element.children);
      //   document.getSelection().setPosition(this.element, focusOffset);
      // }
    }

    this.resetImageId();
    this.onKeyUp(0);
  }

  /**
   * 点击选项对应的删除按钮
   */
  removeItem(optionIndex: number) {
    for (let i = 0, l = this.question.answer.length; i < l; i ++) {
      this.question.answer[i] = document.getElementById(`edit-question-answer-${this.index}-${i}`).innerHTML;
    }
    // document.getElementById(`edit-question-answer-${this.index}-${optionIndex}`).innerHTML = '';
    setTimeout(() => {
      try {
        this.element.removeChild(this.element.getElementsByTagName(this.lineType)[optionIndex]);
        this.resetImageId();
      } catch (error) {
        this.question.answer.splice(optionIndex, 1);
      }
    }, 0);
  }

  /**
   * 重置空格标签的id
   */
  resetImageId() {
    let i = 0,
      dc = 0;
    this.question.blank = this.multiOriginSet.length;
    const lineEles = this.element.getElementsByTagName(this.lineType);
    // ①必先计算已被删除的空格
    while (i < this.question.blank) {
      let hasFlag = false;
      for (let j = 0; j < lineEles.length; j++) {
        if (lineEles[j].id === this.multiOriginSet[i]) {
          hasFlag = true;
          break;
        }
      }
      if (!hasFlag) {
        // console.log('resetImageId()1 remove ' + (i - dc));
        this.question.answer.splice(i - dc, 1);
        dc++; // 因question.answer删除某个元素后长度发生改变，应记录
      } else {
        // console.log(document.getElementById(this.multiOriginSet[i]));
      }
      i++;
    }

    // ②计算新增加或者修改过id的空格
    const itemElements = this.element.getElementsByTagName(this.lineType);
    this.question.blank = itemElements.length;
    this.multiOriginSet = [];
    i = 0;
    while (i < this.question.blank) {
      if (!itemElements[i].id) { // 新添加的空格标签
        this.question.answer.splice(i, 0, '');
      } else if (itemElements[i].getAttribute('countValue') !== ('' + (this.countValue - 1))) { // 粘贴过来的空格
        this.question.answer.splice(i, 0, '');
      }
      itemElements[i].id = 'edit-question-line-' + this.index + '-' + i;
      itemElements[i].innerHTML = '' + (i + 1);
      itemElements[i].setAttribute('countValue', '' + this.countValue);
      this.multiOriginSet[this.multiOriginSet.length] = itemElements[i].id;
      i++;
    }
    this.countValue++;

    // console.log('resetImageId()::end this.lineCount=' + this.question.blank);
  }

  /**
   * 监听用户点击按钮按下
   * @param event
   */
  onKeyDown(event: any) {
    if (event.key === 'Backspace') {
      if (window.getSelection) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        if (range.collapsed) { // 未选取任何内容
          if (range.startContainer.localName) { // 可编辑div或不可编辑label
            if (range.startOffset > 0 &&
              this.element.childNodes[range.startOffset - 1].localName === this.lineType) { // 可编辑div始终保持<br>结尾
              this.element.removeChild(this.element.childNodes[range.startOffset - 1]);
            } else if (range.startOffset === 0 && range.startContainer.previousSibling) {
              if (range.startContainer.previousSibling.localName === this.lineType) {
                this.element.removeChild(range.startContainer.previousSibling);
              }
            }
          } else { // #text节点
            if (range.startOffset === 0) {
              if (range.startContainer.previousSibling) { // 移除该range中的#text节点的上一个兄弟节点<label>
                this.element.removeChild(range.startContainer.previousSibling);
              }
            }
          }
          this.resetImageId();
        } else {
          this.multiCutFlag = true;
        }
      }
    } else if (event.key === 'Control') {

    }
  }

  /**
   * 监听用户点击按钮抬起
   * @param event
   */
  onKeyUp(event: any) {
    if (event.key === 'Backspace') {
      if (this.multiCutFlag) {
        this.multiCutFlag = false;
        this.resetImageId();
      }
    } else if (event.key === 'Control') { // 大致处理可能造成的数据或者空格线的增删
      this.resetImageId();
    }

    if (this.element.lastElementChild) { // 设置可编辑div末尾<br>标签
      if (this.element.lastElementChild.tagName !== 'BR') {
        this.element.appendChild(document.createElement('br'));
      }
    } else {
      this.element.appendChild(document.createElement('br'));
    }

    // TODO: remove the click event before submitting the ereading
    this.question.content = this.element.innerHTML;
  }

  public getItemPrefix(i: number): string {
    return (i + 1) + '.';
  }

  onPaste(e: ClipboardEvent): void {
    // const text = e.clipboardData.getData('text');
    // e.clipboardData.setData('text', text);
    // setTimeout(() => {
    //   this.question.content = this.element.innerHTML;
    //   this.element.innerHTML = this.question.content.replace(/<\/?[^>]*>/g, '').replace(/\$\$/g, '');
    // }, 0);
  }

  public openCKEditor(ev: Event, key: string, type?: number): void {
    try {
      if (_.indexOf(this.editorKeys, key) > -1) {
        this.editorKeys.push(key);
      } else {
        CKEDITOR.inline(ev.currentTarget);
        this.editorKeys.push(key);
      }
    } catch (error) {

    }
  }
}
