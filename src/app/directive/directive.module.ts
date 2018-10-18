import { NgModule } from '@angular/core';
import { DragDirective } from './drag-drop/drag.directive';
import { DropDirective } from './drag-drop/drop.directive';
import { DragDropService } from './drag-drop.service';
import { DebounceClickDirective } from './debounce-click/debounce-click.directive';

@NgModule({
  providers: [
    DragDropService
  ],
  declarations: [
    DragDirective,
    DropDirective,
    DebounceClickDirective
  ],
  exports: [
    DragDirective,
    DropDirective,
    DebounceClickDirective
  ]
})
export class DirectivesModule {}
