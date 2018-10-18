import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PaperQuestionSetChapter } from '../../details/paper-details/data/paperDetailsResponse';
import { MessageService } from '../../../service/message.service';

@Component({
  selector: 'app-paper-analysis',
  templateUrl: './paper-analysis.component.html',
  styleUrls: ['./paper-analysis.component.scss']
})
export class PaperAnalysisComponent implements OnInit {
  options: any;
  option = {
    legend: {
      orient: 'vertical',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      x: 'right',
      y: ' 40%',
      data: ['困难', '较难', '一般', '较易', '简单']
    },

    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },

    series: [
      {
        name: 'main',
        type: 'pie',
        color: ['rgb(210, 10, 10)', 'rgb(13, 194, 179)', 'rgb(67, 165, 240)', 'rgb(240, 171, 63)', 'rgb(195, 209, 41)'],
        data: [],
        label: {
          normal: {
            textStyle: {
              color: '#000'
            }
          }
        },
        labelLine: {
          normal: {
            lineStyle: {
              color: '#000'
            },
            smooth: 0.5,
            length: 10,
            length2: 5
          }
        },
        selectedMode: true,
        selectedOffset: 10,
      }
    ]

  };

  @Input() allScoreCount: number;
  @Input() allQuestionCount: number;
  @Input() paperQuestionSetChapters: PaperQuestionSetChapter[];
  @Output() isCloseAnalysis = new EventEmitter<boolean>();

  constructor(
    private massageService: MessageService
  ) { }

  ngOnInit() {
    if (!this.paperQuestionSetChapters) {
      this.massageService.getPaperQuestionSetChapters().subscribe(paperQuestionSetChapters => {
        this.paperQuestionSetChapters = paperQuestionSetChapters;
        this.options = this.option;
        this.handleDifficult();
      });
    } else {
      this.options = this.option;
      this.handleDifficult();
    }
  }

  closeAnalysis(): void {
    this.isCloseAnalysis.emit(false);
  }

  handleDifficult(): void {
    const dataValues = [];
    const difficulties = [];
    let easyCount = 0;
    let moreEasyCount = 0;
    let normalCount = 0;
    let moreDifficultCount = 0;
    let difficultyCount = 0;
    const n = easyCount;

    this.paperQuestionSetChapters.forEach(questionContents => {
      questionContents.questionsContent.forEach(question => {
        if (question.difficulty) {
          difficulties.push(question.difficulty);
          // console.log('difficulties is a real number: ' + difficulties);
        } else if (!question.difficulty) {
          if (question.questions) {
            question.questions.forEach(subQuestion => {
              if (subQuestion.difficulty) {
                difficulties.push(subQuestion.difficulty);
              }
            }
            );
            // console.log('difficulties is a real number: ' + difficulties);
          } else {
            // difficulties.push(7);
            difficulties.push(Math.round(Math.random() * 10));
            // console.log('difficulties is a random number: ' + difficulties);
          }
        }
      });
    });

    difficulties.forEach(difficulty => {
      if (difficulty < 2.5) {
        difficultyCount++;
      } else if (difficulty >= 2.5 && difficulty < 4.0) {
        moreDifficultCount++;
      } else if (difficulty >= 4.0 && difficulty < 5.1) {
        normalCount++;
      } else if (difficulty >= 5.1 && difficulty < 7.0) {
        moreEasyCount++;
      } else {
        easyCount++;
      }
    });

    // switch (n) {
    //   case difficultyCount: {
    //     dataValues.push({ value: difficultyCount, name: '困难' });
    //     break;
    //   }
    //   case moreDifficultCount: {
    //     dataValues.push({ value: moreDifficultCount, name: '较难' });
    //     break;
    //   }
    //   case normalCount: {
    //     dataValues.push({ value: normalCount, name: '一般' });
    //     break;
    //   }
    //   case moreEasyCount: {
    //     dataValues.push({ value: moreEasyCount, name: '较易' });
    //     break;
    //   }
    //   case easyCount: {
    //     dataValues.push({ value: easyCount, name: '简单' });
    //     break;
    //   }
    //   default: {
    //     break;
    //   }
    // }
    // console.log('dataValues is: ' + dataValues);

    if (difficultyCount) {
      dataValues.push({ value: difficultyCount, name: '困难' });
    }

    if (moreDifficultCount) {
      dataValues.push({ value: moreDifficultCount, name: '较难' });
    }

    if (normalCount) {
      dataValues.push({ value: normalCount, name: '一般' });
    }

    if (moreEasyCount) {
      dataValues.push({ value: moreEasyCount, name: '较易' });
    }

    if (easyCount) {
      dataValues.push({ value: easyCount, name: '简单' });
    }
    this.options.series[0].data = dataValues.slice();
    // console.log('dataValues is' + this.options.series[0].data);
  }

}
