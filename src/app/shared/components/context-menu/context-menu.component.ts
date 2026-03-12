import { Component, input, output, ElementRef, HostListener, inject } from '@angular/core';

export interface ContextMenuItem {
  label: string;
  action: string;
  icon?: string;
  separator?: boolean;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  template: `
    <div class="context-menu fixed z-50" [style.left.px]="x()" [style.top.px]="y()">
      @for (item of items(); track item.action) {
        @if (item.separator) {
          <div class="context-menu-separator"></div>
        }
        <button class="context-menu-item" (click)="menuSelect.emit(item.action)">
          <span class="context-menu-icon">
            @if (item.icon) {
              <span class="material-symbols-outlined" style="font-size: 16px; font-variation-settings: 'opsz' 20, 'wght' 300;">{{
                item.icon
              }}</span>
            }
          </span>
          <span class="context-menu-label">{{ item.label }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    .context-menu {
      min-width: 180px;
      padding: 4px 0;
      border-radius: 6px;
      background-color: var(--context-bg);
      border: 1px solid var(--context-border);
      box-shadow: var(--context-shadow);
      color: var(--text-primary);
    }

    .context-menu-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 4px 12px 4px 4px;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 12px;
      line-height: 1.4;
      cursor: pointer;
      border-radius: 0;
      text-align: left;
      gap: 0;
    }

    .context-menu-item:hover {
      background-color: var(--hover-bg);
      color: var(--text-primary);
    }

    .context-menu-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      flex-shrink: 0;
      color: var(--text-muted);
    }

    .context-menu-item:hover .context-menu-icon {
      color: var(--text-primary);
    }

    .context-menu-label {
      flex: 1;
    }

    .context-menu-separator {
      height: 1px;
      margin: 4px 0;
      background-color: var(--context-border);
    }
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
