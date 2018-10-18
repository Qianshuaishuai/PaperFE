import { Component, OnInit, AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  rawString = 'fetching raw string...';

  private initEditor: any;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.initEditor) {
      return;
    } else {
      this.initEditor = CKEDITOR.inline('initEditor');
    }
  }
}
