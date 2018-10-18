import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPaperComponent } from './preview-paper.component';

describe('PreviewPaperComponent', () => {
  let component: PreviewPaperComponent;
  let fixture: ComponentFixture<PreviewPaperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewPaperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
