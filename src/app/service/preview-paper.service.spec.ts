import { TestBed, inject } from '@angular/core/testing';

import { PreviewPaperService } from './preview-paper.service';

describe('PreviewPaperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviewPaperService]
    });
  });

  it('should be created', inject([PreviewPaperService], (service: PreviewPaperService) => {
    expect(service).toBeTruthy();
  }));
});
