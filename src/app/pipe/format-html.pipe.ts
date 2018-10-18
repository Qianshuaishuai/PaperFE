import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatHTML'
})
export class FormatHTMLPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    // if (args.indexOf('content') !== 0) {
    value = value.replace(/\<p\>([\s\S]*)\<\/p\>/i, ($0, $1, $2) => {
      const result = $1;
      return result;
    });
    // }
    value = value.replace(/\<span style="margin-left: 20px;" id="(.*?)"\>\<\/span\>/, '');
    if (args === 'option') {
      value = value.substr(3);
    }
    value = value.replace(/\<p\>\<\/p\>/g, '');
    return value;
  }

}
