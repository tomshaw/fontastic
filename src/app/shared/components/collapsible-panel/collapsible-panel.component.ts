import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-collapsible-panel',
  standalone: true,
  template: `
    <div class="flex flex-col min-h-0">
      <button
        class="flex items-center px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest cursor-pointer select-none w-full text-left transition-colors"
        [style.background-color]="'var(--surface-2)'"
        [style.border-top]="'1px solid var(--border-subtle)'"
        [style.border-bottom]="'1px solid var(--border-subtle)'"
        [style.color]="'var(--text-muted)'"
        (click)="expanded.set(!expanded())"
      >
        <span
          class="material-symbols-outlined icon-sm mr-1 transition-transform duration-200"
          [class.rotate-90]="expanded()"
          style="font-variation-settings: 'opsz' 20, 'wght' 500"
        >
          chevron_right
        </span>
        {{ title() }}
        <span class="ml-auto flex items-center">
          <ng-content select="[panelActions]" />
        </span>
      </button>
      <div
        class="grid transition-[grid-template-rows] duration-200 ease-in-out"
        [class.grid-rows-[1fr]]="expanded()"
        [class.grid-rows-[0fr]]="!expanded()"
      >
        <div class="overflow-hidden">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class CollapsiblePanelComponent {
  readonly title = input.required<string>();
  readonly expanded = model(true);
}
