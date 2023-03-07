import { waitForAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [{
        provide: AlertService,
      }]
    });
  }));

  it('should be created', () => {
    const service: AlertService = TestBed.inject(AlertService);
    expect(service).toBeTruthy();
  });
});
