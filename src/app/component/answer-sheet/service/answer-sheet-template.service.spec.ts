import { TestBed, inject } from '@angular/core/testing';

import { AnswerSheetTemplateService } from './answer-sheet-template.service';

describe('AnswerSheetTemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnswerSheetTemplateService]
    });
  });

  it('should be created', inject([AnswerSheetTemplateService], (service: AnswerSheetTemplateService) => {
    expect(service).toBeTruthy();
  }));
});
