import { Directive, ElementRef, HostListener, Output, EventEmitter, inject } from '@angular/core';

@Directive({
  selector: '[appModalBackdrop]',
  standalone: true,
})
export class ModalBackdropDirective {
  @Output() backdropClick = new EventEmitter<void>();

  private el = inject(ElementRef);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (event.target === this.el.nativeElement) {
      this.backdropClick.emit();
    }
  }
}
