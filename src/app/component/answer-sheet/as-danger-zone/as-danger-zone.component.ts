import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-as-danger-zone',
  templateUrl: './as-danger-zone.component.html',
  styleUrls: ['./as-danger-zone.component.scss']
})
export class AsDangerZoneComponent implements OnInit {

  @Input() isThreeCol: boolean;
  @Input() isSetNoAnswerArea: boolean;
  @Input() mainWidth: number;
  @Input() noAnswerAreaHeight: number;

  borderTop_Up: string;
  borderRight_Up: string;
  borderBottom_Up: string;
  borderLeft_Up: string;
  borderTop_Down: string;
  borderRight_Down: string;
  borderBottom_Down: string;
  borderLeft_Down: string;
  dangerZoneColor = '#EDEDED';

  constructor() { }

  ngOnInit() {
    this.borderTop_Up = `7.5mm solid ${this.dangerZoneColor}`;
    this.borderBottom_Up = `7.5mm solid ${this.dangerZoneColor}`;
    this.borderLeft_Up = `${this.mainWidth / 2}mm solid ${this.dangerZoneColor}`;
    this.borderRight_Up = `${this.mainWidth / 2}mm solid ${this.dangerZoneColor}`;
    this.borderTop_Down = `${this.noAnswerAreaHeight / 2}mm solid ${this.dangerZoneColor}`;
    this.borderBottom_Down = `${this.noAnswerAreaHeight / 2}mm solid ${this.dangerZoneColor}`;
    this.borderLeft_Down = `${this.mainWidth / 2}mm solid ${this.dangerZoneColor}`;
    this.borderRight_Down = `${this.mainWidth / 2}mm solid ${this.dangerZoneColor}`;
  }

}
