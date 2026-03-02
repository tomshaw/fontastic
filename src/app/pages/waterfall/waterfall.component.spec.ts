import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterfallComponent } from './waterfall.component';

describe('WaterfallComponent', () => {
  let component: WaterfallComponent;
  let fixture: ComponentFixture<WaterfallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterfallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterfallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
