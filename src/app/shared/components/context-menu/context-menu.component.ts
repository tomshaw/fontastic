import { Component, input, output, ElementRef, HostListener, inject } from '@angular/core';

export interface ContextMenuItem {
  label: string;
  action: string;
  icon?: string;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  template: `
    <div
      class="fixed z-50 min-w-[160px] rounded-lg py-1"
      [style.left.px]="x()"
      [style.top.px]="y()"
      [style.background-color]="'var(--context-bg)'"
      [style.border]="'1px solid var(--context-border)'"
      [style.box-shadow]="'var(--context-shadow)'"
      [style.color]="'var(--text-primary)'"
    >
      @for (item of items(); track item.action) {
        <button
          class="w-full text-left px-4 py-1.5 text-xs cursor-pointer transition-colors"
          [style.color]="'var(--text-secondary)'"
          (mouseenter)="
            $any($event.target).style.backgroundColor = 'var(--hover-bg)'; $any($event.target).style.color = 'var(--text-primary)'
          "
          (mouseleave)="
            $any($event.target).style.backgroundColor = 'transparent'; $any($event.target).style.color = 'var(--text-secondary)'
          "
          (click)="menuSelect.emit(item.action)"
        >
          {{ item.label }}
        </button>
      }
    </div>
  `,
})
export class ContextMenuComponent {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly items = input.required<ContextMenuItem[]>();
  readonly menuSelect = output<string>();
  readonly menuClose = output<void>();

  private el = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.menuClose.emit();
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.menuClose.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.menuClose.emit();
  }
}
