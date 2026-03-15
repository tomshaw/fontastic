import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

@Directive({
  selector: '[appDisabledOpacity]',
  standalone: true,
})
export class DisabledOpacityDirective implements OnChanges {
  @Input('appDisabledOpacity') isDisabled = false;
  @Input() opacityValue = '0.3';

  private el = inject(ElementRef);

  ngOnChanges() {
    const el = this.el.nativeElement;
    el.disabled = this.isDisabled;
    el.style.opacity = this.isDisabled ? this.opacityValue : '';
  }
}
