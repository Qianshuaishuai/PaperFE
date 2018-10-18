import { Directive, OnInit, HostListener, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[appDebounceClick]'
})
export class DebounceClickDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 500;
  @Output() debounceClick = new EventEmitter();
  private clicks = new Subject<any>();
  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
    this.clicks
      .pipe(debounceTime(this.debounceTime))
      .subscribe(event => {
        this.debounceClick.emit(event);
      });
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
    }
  }
}
