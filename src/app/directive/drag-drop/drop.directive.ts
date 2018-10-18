import { Directive, Input, Output, EventEmitter, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { DragDropService, DragData} from '../drag-drop.service';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators'

@Directive({
  selector: '[appDroppable][dragEnterClass]',
})
export class DropDirective {

  @Output() dropped: EventEmitter<DragData> = new EventEmitter();
  @Input() dragEnterClass = '';
  private drag$: Observable<DragData | null>;

  constructor(
    private el: ElementRef,
    private rd: Renderer2,
    private service: DragDropService) {
      this.drag$ = this.service.getDragData().pipe(take(1));
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.drag$.subscribe(dragData => {
        this.rd.addClass(this.el.nativeElement, this.dragEnterClass);
        this.rd.setProperty(this.el.nativeElement, 'dataTransfer.effectAllowed', 'all');
        this.rd.setProperty(this.el.nativeElement, 'dataTransfer.dropEffect', 'move');
      });
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.drag$.subscribe(dragData => {
        this.rd.setProperty(ev, 'dataTransfer.effectAllowed', 'all');
        this.rd.setProperty(ev, 'dataTransfer.dropEffect', 'move');
      });
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.drag$.subscribe(dragData => {
        this.rd.removeClass(this.el.nativeElement, this.dragEnterClass);
      });
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.drag$.subscribe(dragData => {
        this.rd.removeClass(this.el.nativeElement, this.dragEnterClass);
        this.dropped.emit(dragData);
        this.service.clearDragData();
      });
    }
  }

}
