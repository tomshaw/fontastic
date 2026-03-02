import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectComponent } from './inspect.component';

describe('InspectComponent', () => {
  let component: InspectComponent;
  let fixture: ComponentFixture<InspectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
