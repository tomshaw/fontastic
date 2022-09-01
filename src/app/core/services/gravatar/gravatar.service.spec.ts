import { TestBed } from '@angular/core/testing';

import { GravatarService } from './gravatar.service';

describe('GravatarService', () => {
  let service: GravatarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GravatarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
