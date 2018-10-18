import { Component, OnInit, Input, Output, Renderer2, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-as-info-barcode',
  templateUrl: './as-info-barcode.component.html',
  styleUrls: ['./as-info-barcode.component.scss']
})
export class AsInfoBarcodeComponent implements OnInit {

  @Input() isThreeCol: boolean;
  @Input() attention: string;

  @Output() attentionChange = new EventEmitter<any>();
  @Output() attentionOverflow = new EventEmitter<any>();

  constructor(
    private rd: Renderer2
  ) { }

  ngOnInit() {
  }

  onFocus(e): void {
    const el = <HTMLElement>e.currentTarget;
    this.rd.setStyle(el, 'border', '1px solid black');
  }

  public validateNotice(e): void {
    const el = <HTMLElement>e.currentTarget;
    const elHeight = el.offsetHeight;
    // 测试版有ng注释
    // const div = <HTMLElement>el.childNodes[1];
    // 正式版没ng注释
    const div = <HTMLElement>el.childNodes[0];
    const divHeight = div.offsetHeight;
    if (elHeight < divHeight) {
      this.rd.setStyle(el, 'border', '1px solid red');
      this.attentionOverflow.emit();
    } else {
      this.attention = e.currentTarget.innerHTML;
      this.attentionChange.emit(this.attention);
    }
  }

}
