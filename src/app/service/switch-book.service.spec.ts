import { TestBed, inject } from '@angular/core/testing';

import { SwitchBookService } from './switch-book.service';

describe('SwitchBookService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwitchBookService]
    });
  });

  it('should be created', inject([SwitchBookService], (service: SwitchBookService) => {
    expect(service).toBeTruthy();
  }));
});
