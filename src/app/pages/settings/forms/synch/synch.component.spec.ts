import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynchComponent } from './synch.component';

describe('SynchComponent', () => {
  let component: SynchComponent;
  let fixture: ComponentFixture<SynchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SynchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SynchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
