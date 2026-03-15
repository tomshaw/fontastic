import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

@Directive({
  selector: '[appScrollReset]',
  standalone: true,
})
export class ScrollResetDirective implements OnChanges {
  @Input('appScrollReset') trigger: unknown;

  private el = inject(ElementRef);

  ngOnChanges() {
    this.el.nativeElement.scrollTo(0, 0);
  }
}
