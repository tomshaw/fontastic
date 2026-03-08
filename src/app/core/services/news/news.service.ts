import { Injectable, inject, signal, computed } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import { MessageService } from '../message/message.service';
import { StorageType } from '@main/enums';
import type { NewsArticlesType, NewsType } from '@main/types';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly electron = inject(ElectronService);
  private readonly message = inject(MessageService);

  readonly config = signal<NewsType | null>(null);

  readonly hasArticles = computed(() => {
    const c = this.config();
    return !!c?.apiKey && !!c?.articles?.length;
  });

  readonly articles = computed(() => this.config()?.articles ?? []);
  readonly articleCount = computed(() => this.articles().length);

  readonly sourceCount = computed(() => {
    const articles = this.articles();
    return new Set(articles.map((a) => a.source?.name).filter(Boolean)).size;
  });

  readonly authorCount = computed(() => {
    const articles = this.articles();
    return new Set(articles.map((a) => a.author).filter(Boolean)).size;
  });

  readonly lastFetched = computed(() => {
    const ts = this.config()?.ts;
    if (!ts) return 'Never';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  });

  constructor() {
    this.electron.ready.then(() => this.refresh());
  }

  async refresh() {
    const config = (await this.message.get(StorageType.News, null)) as NewsType | null;
    this.config.set(config);
  }

  randomArticle(): NewsArticlesType | null {
    const list = this.articles();
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }
}
