import { TestBed, inject } from '@angular/core/testing';

import { AnswerSheetService } from './answer-sheet.service';

describe('AnswerSheetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnswerSheetService]
    });
  });

  it('should be created', inject([AnswerSheetService], (service: AnswerSheetService) => {
    expect(service).toBeTruthy();
  }));
});
