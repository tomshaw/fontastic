import { waitForAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [{
        provide: BreadcrumbService,
      }]
    });
  }));

  it('should be created', () => {
    const service: BreadcrumbService = TestBed.inject(BreadcrumbService);
    expect(service).toBeTruthy();
  });
});
