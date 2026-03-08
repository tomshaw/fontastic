import { Component, inject } from '@angular/core';
import { NewsService } from '../../../core/services';
import { CollapsiblePanelComponent } from '../../../shared/components/collapsible-panel/collapsible-panel.component';

@Component({
  selector: 'app-news-stats',
  standalone: true,
  imports: [CollapsiblePanelComponent],
  template: `
    @if (news.hasArticles()) {
      <app-collapsible-panel title="News">
        <ul class="flex flex-col py-0.5">
          <li class="flex items-center px-3.5 py-1 text-xs font-normal">
            <span
              class="material-symbols-outlined icon-sm mr-2"
              style="font-variation-settings: 'opsz' 20, 'wght' 300; color: var(--text-muted)"
              >article</span
            >
            <span class="flex-1">Total Articles</span>
            <span class="text-[11px]" style="color: var(--text-muted)">{{ news.articleCount() }}</span>
          </li>
          <li class="flex items-center px-3.5 py-1 text-xs font-normal">
            <span
              class="material-symbols-outlined icon-sm mr-2"
              style="font-variation-settings: 'opsz' 20, 'wght' 300; color: var(--text-muted)"
              >source</span
            >
            <span class="flex-1">Sources</span>
            <span class="text-[11px]" style="color: var(--text-muted)">{{ news.sourceCount() }}</span>
          </li>
          <li class="flex items-center px-3.5 py-1 text-xs font-normal">
            <span
              class="material-symbols-outlined icon-sm mr-2"
              style="font-variation-settings: 'opsz' 20, 'wght' 300; color: var(--text-muted)"
              >person</span
            >
            <span class="flex-1">Authors</span>
            <span class="text-[11px]" style="color: var(--text-muted)">{{ news.authorCount() }}</span>
          </li>
          <li class="flex items-center px-3.5 py-1 text-xs font-normal">
            <span
              class="material-symbols-outlined icon-sm mr-2"
              style="font-variation-settings: 'opsz' 20, 'wght' 300; color: var(--text-muted)"
              >schedule</span
            >
            <span class="flex-1">Last Fetched</span>
            <span class="text-[11px]" style="color: var(--text-muted)">{{ news.lastFetched() }}</span>
          </li>
        </ul>
      </app-collapsible-panel>
    }
  `,
})
export class NewsStatsComponent {
  readonly news = inject(NewsService);
}
