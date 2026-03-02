import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safehtml.pipe';

describe('SafeHtmlPipe', () => {
  it('create an instance', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const pipe = new SafeHtmlPipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
