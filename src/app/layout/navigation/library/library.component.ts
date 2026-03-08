import { Component, inject, computed, Signal } from '@angular/core';
import { DatabaseService } from '../../../core/services';

interface LibraryItem {
  label: string;
  icon: string;
  filter: string;
  count: Signal<number>;
}

@Component({
  selector: 'app-library',
  standalone: true,
  template: `
    <ul class="flex flex-col py-0.5">
      @for (item of items; track item.filter) {
        <li>
          <a
            class="flex items-center px-3.5 py-1 text-xs font-normal cursor-pointer transition-colors"
            [style.background-color]="db.activeFilter() === item.filter ? 'var(--selected-bg)' : 'transparent'"
            [style.color]="db.activeFilter() === item.filter ? 'var(--text-primary)' : 'inherit'"
            (click)="db.selectFilter(item.filter)"
            (mouseenter)="
              $any($event.target).style.backgroundColor = db.activeFilter() === item.filter ? 'var(--selected-bg)' : 'var(--hover-bg)'
            "
            (mouseleave)="
              $any($event.target).style.backgroundColor = db.activeFilter() === item.filter ? 'var(--selected-bg)' : 'transparent'
            "
          >
            <span
              class="material-symbols-outlined icon-sm mr-2"
              style="font-variation-settings: 'opsz' 20, 'wght' 300; color: var(--text-muted)"
              >{{ item.icon }}</span
            >
            <span class="flex-1" [title]="item.label">{{ item.label }}</span>
            <span class="text-[11px]" [style.color]="'var(--text-muted)'">{{ item.count() }}</span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class LibraryComponent {
  readonly db = inject(DatabaseService);

  readonly items: LibraryItem[] = [
    { label: 'All Fonts', icon: 'folder', filter: 'all', count: computed(() => this.db.systemStats()?.rowCount ?? 0) },
    { label: 'My Favorites', icon: 'favorite', filter: 'favorites', count: computed(() => this.db.systemStats()?.favoriteCount ?? 0) },
    { label: 'System Fonts', icon: 'computer', filter: 'system', count: computed(() => this.db.systemStats()?.systemCount ?? 0) },
  ];
}
