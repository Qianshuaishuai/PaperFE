import { Component, OnInit, Input } from '@angular/core';
import { Question } from '../../details/paper-details/data/paperDetailsResponse';
import { Utils } from '../../../utils';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {

  @Input() question: Question;
  @Input() level: string;
  rank: number;
  keyPoints = [];

  constructor(
    public utils: Utils
  ) { }

  ngOnInit() {
    this.rank = +this.level;
    if (this.question.questions) {
      this.handleKeyPoint(this.question.questions);
    }
  }

  // 去除材料题中重复的知识点
  private handleKeyPoint(questions: Question[]): void {
    questions.forEach(question => {
      question.keypoints.forEach(keyPoint => {
        let flag = true;
        this.keyPoints.forEach(setKeyPoints => {
          if (keyPoint.id === setKeyPoints.id) {
            flag = false;
          }
        });
        if (flag) {
          this.keyPoints.push(keyPoint);
        }
      });
    });
  }

}
