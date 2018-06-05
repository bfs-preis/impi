import { TestBed, inject } from '@angular/core/testing';

import { ProcessResultService } from './process-result.service';

describe('ProcessResultService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessResultService]
    });
  });

  it('should be created', inject([ProcessResultService], (service: ProcessResultService) => {
    expect(service).toBeTruthy();
  }));
});
