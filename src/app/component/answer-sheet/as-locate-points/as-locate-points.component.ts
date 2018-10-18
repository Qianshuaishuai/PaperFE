import { Component, OnInit, Input } from '@angular/core';

import { BorderPoint } from './borderPoint';

@Component({
  selector: 'app-as-locate-points',
  templateUrl: './as-locate-points.component.html',
  styleUrls: ['./as-locate-points.component.scss']
})
export class AsLocatePointsComponent implements OnInit {

  borderPointCount = 5;
  borderPoints: BorderPoint[] = [];
  firstBorderPointTop = 49.5;

  @Input() isLeftBorder: boolean;
  @Input() isRightBorder: boolean;
  @Input() isThreeCol: boolean;

  constructor() { }

  ngOnInit() {
    for (let i = 1; i <= this.borderPointCount; i++) {
      this.borderPoints.push({top: i * this.firstBorderPointTop});
    }
  }

}
