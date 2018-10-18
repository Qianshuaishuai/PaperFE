import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from '../../../service/loader.service';
import { LoaderState } from '../../../bean/loader-state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {

  constructor(
    private loaderService: LoaderService
  ) { }

  private subscription: Subscription;

  state = true;

  ngOnInit() {
    this.subscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
      this.state = state.show;
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }

}
