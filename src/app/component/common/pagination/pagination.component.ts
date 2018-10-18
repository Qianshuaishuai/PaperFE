import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MessageService } from '../../../service/message.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnDestroy {

  @Output() onSelectPage = new EventEmitter<number>();

  public hasPrevious: boolean;
  public hasNext: boolean;
  public currentPage: number;
  public jumpPage: number;
  public pageNumbers = [1, 2, 3, 4, 5];
  public totalPage: number;
  private totalPageSub: Subscription;

  constructor(
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.currentPage = 1;
    this.totalPageSub = this.messageService.getTotalPage().subscribe(totalPage => {
      this.totalPage = totalPage;
      // -1 代表切换试卷列表
      if (!this.messageService.getIsReturnFromDetail() && totalPage === -1) {
        this.currentPage = 1;
        this.onSelectPage.emit(1);
      }
      // 返回到进入页
      if (this.messageService.getIsReturnFromDetail()) {
        this.currentPage = this.messageService.getLocatedPage();
        this.messageService.setIsReturnFromDetail(false);
      }

      this.paginate();
    });

    this.paginate();
  }

  public clickPreviousPage(): void {
    this.onSelectPage.emit(this.currentPage - 1);
    this.currentPage--;
    this.paginate();
  }

  public selectPageNumber(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.onSelectPage.emit(pageNumber);
    this.paginate();
  }

  public clickNextPage(): void {
    this.onSelectPage.emit(this.currentPage + 1);
    this.currentPage++;
    this.paginate();
  }

  public jump(): void {
    this.jumpPage = _.toNumber(this.jumpPage);
    if (this.jumpPage === 0) {
      return;
    }
    if (this.jumpPage > this.totalPage) {
      this.jumpPage = this.totalPage;
    }
    this.onSelectPage.emit(this.jumpPage);
    this.currentPage = this.jumpPage;
    this.paginate();
  }

  public paginate(): void {
    if (this.currentPage > 3) {
      if (this.currentPage === this.totalPage) {
        this.pageNumbers = [this.currentPage - 4, this.currentPage - 3, this.currentPage - 2, this.currentPage - 1, this.currentPage];
        if (this.currentPage === 4) {
          this.pageNumbers = [this.currentPage - 3, this.currentPage - 2, this.currentPage - 1, this.currentPage];
        }
      } else if ((this.currentPage + 1) === this.totalPage) {
        this.pageNumbers = [this.currentPage - 3, this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1];
      } else {
        this.pageNumbers = [this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2];
      }
    } else {
      this.pageNumbers = [1, 2, 3, 4, 5].slice(0, this.totalPage);
    }
    if (this.currentPage === 0) { this.currentPage = 1; }
  }

  ngOnDestroy(): void {
    if (this.totalPageSub) {
      this.totalPageSub.unsubscribe();
    }
  }

}
