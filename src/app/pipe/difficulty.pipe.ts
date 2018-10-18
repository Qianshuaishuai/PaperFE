import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'difficulty'
})
export class DifficultyPipe implements PipeTransform {

  // <!-- <span *ngIf="paper.difficulty > 0 && paper.difficulty < 4.0" class="difficulty info">难度：困难</span>
  //       <span *ngIf="paper.difficulty >= 4.0 && paper.difficulty < 5.1" class="difficulty info">难度：一般</span>
  //       <span *ngIf="paper.difficulty >= 5.1" class="difficulty info">难度：简单</span> -->
  transform(difficulty: any, args?: any): any {
    if (difficulty > 0 && difficulty < 4.0) {
      return '困难';
    } else if (difficulty >= 4.0 && difficulty < 5.1) {
      return '一般';
    } else if (difficulty >= 5.1) {
      return '简单';
    }
  }

}
