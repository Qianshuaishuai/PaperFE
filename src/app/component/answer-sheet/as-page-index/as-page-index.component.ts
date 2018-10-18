import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-as-page-index',
  templateUrl: './as-page-index.component.html',
  styleUrls: ['./as-page-index.component.scss']
})
export class AsPageIndexComponent implements OnInit {

  @Input() pageIndex: number;
  @Input() isThreeCol: boolean;

  constructor() { }

  ngOnInit() {
  }

}
