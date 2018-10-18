import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-as-header-front',
  templateUrl: './as-header-front.component.html',
  styleUrls: ['./as-header-front.component.scss']
})
export class AsHeaderFrontComponent implements OnInit {

  @Input() title: string;
  @Input() isThreeCol: boolean;

  @Output() overflow = new EventEmitter<any>();
  @Output() titleChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onFocus(e): void {
    e.currentTarget.setAttribute('style', 'border: none');
  }

  onBlur(e): void {
    if (e.currentTarget.scrollHeight > 60) {
      this.overflow.emit();
      e.currentTarget.setAttribute('style', 'border: 1px solid red');
    } else {
      if (!this.title) {
        e.currentTarget.setAttribute('style', 'border: 1px solid red');
      }
      this.titleChange.emit(this.title);
    }
  }

}
