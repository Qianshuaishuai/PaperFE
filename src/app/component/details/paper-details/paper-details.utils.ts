import { Injectable } from '@angular/core';
import { OPTIONS, SALT, TEX_URL } from '../../../constants';
import { Md5 } from 'ts-md5/dist/md5';
import { Base64 } from 'js-base64';
const baseUrl = 'http://ozuzef1u3.bkt.clouddn.com/'; // 测试地址

const imageUrl = 'img/';
const audioUrl = 'audio/';
const paperUrl = 'paper';

let gradeType = 'chuzhong/';

const answerItems = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

@Injectable()
export class PaperDetailsUtils {
    // 处理需要渲染的html标签
    dealStr(str): string {
        // if (str === undefined) {
        //     return str;
        // }
        // str = this.matchingP(str);
        str = this.matchTex(str);
        str = this.matchWavy(str);
        str = this.matchingImg(str);
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
        if (t.indexOf('</tex>') === -1) {
            return t;
        }
        // t = t.replace(/\<tex=(.*?)\>/g, '');
        t = t.replace(/%\<\/tex\>/g, '\<\/tex\>');
        // t = t.replace(/\<tex = (.*?)\>/g, '');
        // t = t.replace(/ % \<\/tex\>/g, '');
        return t;
    }


    // 处理图片标签
    matchingImg(t): void {
        if (t.indexOf('</img>') === -1) {
            return t;
        }
        t = t.replace(/\<img(.*?)\>(.*?)\<\/img\>/g, function ($0, $1, $2) {
            const rest = '\<img src=\'' + baseUrl + gradeType + imageUrl + $2 + '\'\>\<\/img\>';
            return rest;
        });
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
        if (t.indexOf('~') === -1) {
            return t;
        }
        return t.replace(/(~@)+/ig, '\\');
    }

    // 公式转换
    // tslint:disable-next-line:one-line
    dealTex(tex: string): string {
        if (tex.indexOf('</tex>') === -1) {
            return tex;
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
    // tslint:disable-next-line:one-line
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
        // tslint:disable-next-line:one-line
        while (i--) {
            // tslint:disable-next-line:one-line
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
        const china = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');
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
    setResGradeType(semesterId): void {
        // tslint:disable-next-line:curly
        if (semesterId > 0 && semesterId <= 5) gradeType = 'gaozhong/';
        // tslint:disable-next-line:curly
        else if (semesterId > 5 && semesterId <= 14) gradeType = 'chuzhong/';
    }

    /**
     * 获取题目序号
     * @param str 题目内容
     * @param index 题目索引
     * @param flag 标识是否材料题 0 不是材料题 0 表示材料题
     */
    getQuestionSerialNumber(str: string, index: number, flag: number): string {
        if (flag === 0) {
            return str.replace(/\<p\>/, '<p>' + index + '. ');
        } else {
            return str.replace(/\<p\>/, '<p>' + '（' + index + ')' + ' ');
        }
    }

    getOptionSerialNumber(str: string, index: number): string {
        if (str.indexOf('<p>') !== -1) {
            return str.replace(/\<p\>/, '<p>' + OPTIONS[index] + '. ');
        } else {
            return OPTIONS[index] + '. ' + str;
        }
    }
}
