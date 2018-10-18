import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperAnalysisComponent } from './paper-analysis.component';

describe('PaperAnalysisComponent', () => {
  let component: PaperAnalysisComponent;
  let fixture: ComponentFixture<PaperAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaperAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
