import { Directive, ElementRef, HostListener, Input, OnChanges, inject } from '@angular/core';

@Directive({
  selector: '[appHoverHighlight]',
  standalone: true,
})
export class HoverHighlightDirective implements OnChanges {
  @Input('appHoverHighlight') selected = false;
  @Input() hoverBg = 'var(--hover-bg)';
  @Input() selectedBg = 'var(--selected-bg)';
  @Input() normalBg = 'transparent';
  @Input() selectedColor = '';
  @Input() normalColor = '';

  private el = inject(ElementRef);

  ngOnChanges() {
    this.applyStyles();
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.selected ? this.selectedBg : this.hoverBg;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.applyStyles();
  }

  private applyStyles() {
    const el = this.el.nativeElement;
    el.style.backgroundColor = this.selected ? this.selectedBg : this.normalBg;
    if (this.selectedColor || this.normalColor) {
      el.style.color = this.selected ? this.selectedColor : this.normalColor;
    }
  }
}
