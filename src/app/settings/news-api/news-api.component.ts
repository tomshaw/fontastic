import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, NewsService } from '../../core/services';
import { StorageType } from '@main/enums';
import type { NewsType } from '@main/types';

@Component({
  selector: 'app-settings-news-api',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './news-api.component.html',
})
export class SettingsNewsApiComponent implements OnInit {
  private readonly message = inject(MessageService);
  private readonly news = inject(NewsService);

  readonly newsApiKey = signal('');
  readonly saveStatus = signal<'idle' | 'saved'>('idle');
  readonly fetchStatus = signal<'idle' | 'fetching' | 'done' | 'error'>('idle');
  readonly fetchMessage = signal('');

  async ngOnInit() {
    const config = (await this.message.get(StorageType.News, null)) as NewsType | null;
    if (config?.apiKey) {
      this.newsApiKey.set(config.apiKey);
    }
  }

  async onSaveNewsApiKey() {
    const apiKey = this.newsApiKey();
    if (!apiKey) return;
    await this.message.set(StorageType.News, { apiKey });
    this.saveStatus.set('saved');
    await this.news.refresh();
    setTimeout(() => this.saveStatus.set('idle'), 2000);
  }

  async onFetchNews() {
    this.fetchStatus.set('fetching');
    this.fetchMessage.set('');
    try {
      const endpoint = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${this.newsApiKey()}`;
      const result = await this.message.fetchLatestNews({ endpoint });
      const count = result?.articles?.length ?? 0;
      this.fetchMessage.set(`Fetched ${count} article${count !== 1 ? 's' : ''}.`);
      this.fetchStatus.set('done');
      await this.news.refresh();
    } catch {
      this.fetchMessage.set('Failed to fetch articles.');
      this.fetchStatus.set('error');
    }
    setTimeout(() => {
      this.fetchStatus.set('idle');
      this.fetchMessage.set('');
    }, 3000);
  }
}
