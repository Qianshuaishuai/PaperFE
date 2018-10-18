import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../service/message.service';
import { Courseware } from '../../../bean/courseware';
import { PropertyService } from '../../../service/property.service';
import { PAPER, GROUNP_VOLUME } from '../../../constants';

@Component({
  selector: 'app-paper-library',
  templateUrl: './paper-library.component.html',
  styleUrls: ['./paper-library.component.scss']
})
export class PaperLibraryComponent implements OnInit, OnDestroy {
  selectedResourceList: Courseware[] = [];

  isShowSelectedResource: boolean;

  selectedResourceListSubscription: Subscription;

  background: string;
  color: string;

  selectResourceCount = 0;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    document.getElementsByTagName('body')[0].style.overflow = 'auto';

    this.selectResource();
  }

  mouseEnter(): void {
    this.isShowSelectedResource = true;
    this.background = '#2d9fff';
    this.color = '#ffffff';
  }

  mouseLeave(): void {
    this.isShowSelectedResource = false;
    this.background = '#f4faff';
    this.color = '#2d9fff';
  }

  clickSelectedResource() {
    if (!this.isShowSelectedResource) {
      this.isShowSelectedResource = true;
    } else {
      this.isShowSelectedResource = false;
    }
  }

  complete() {
    // this.propertyService.clear();
    window.close();
  }

  selectResource() {
    this.selectedResourceListSubscription = this.messageService.getSelectedResourceList().subscribe(list => {
      const temp = list.filter(paper => (paper.F_type_detail === PAPER || paper.F_type_detail === GROUNP_VOLUME));
      if (temp.length > 0) {
        temp.forEach((item, index) => {
          item.F_title = item.F_title.replace(/\<mark\>(.*?)\<\/mark\>/g, function ($0, $1) {
            const title = $1;
            return title;
          });
          this.selectedResourceList = temp;
          this.selectResourceCount = this.selectedResourceList.length;
        });
      } else {
        this.selectedResourceList.length = 0;
        this.selectResourceCount = 0;
      }
    }, error => console.log('Selected Resource: ' + error));
  }

  cancelQuote(id: number) {
    this.messageService.sendCancelQuote(id);
  }

  // return() {
  //   window.close();
  // }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.

    if (this.selectedResourceListSubscription !== undefined) {
      this.selectedResourceListSubscription.unsubscribe();
    }

    // this.propertyService.clear();
  }
}
