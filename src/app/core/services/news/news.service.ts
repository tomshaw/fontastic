import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '@app/core/services/config/config.service';
import { MessageService } from '@app/core/services/message/message.service';
import { LatestNewsModel } from '@app/core/model/LatestNewsModel';
import { StorageType } from '@main/enums';
import { NewsType } from '@main/types';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  oneHour = 60 * 60 * 1000;

  endpoints: any = {
    sources: 'https://newsapi.org/v2/top-headlines/sources?country=us&apiKey=',
    articles: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=',
    business: 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey='
  };

  _latestNews = new BehaviorSubject(new LatestNewsModel());
  watchLatestNews$ = this._latestNews.asObservable();

  constructor(
    private configService: ConfigService,
    private messageService: MessageService
  ) {
    if (this.configService.has(StorageType.News)) {
      this.setLatestNews(this.configService.get(StorageType.News));
    }

    this.fetchLatestNews();
  }

  get currentTime(): number {
    return Date.now();
  }

  get timeUTCString(): string {
    return new Date(this.currentTime).toUTCString();
  }

  getLatestNews() {
    return this._latestNews.getValue();
  }

  setLatestNews(items: any = []) {
    this._latestNews.next(items);
  }

  checkTime(timeStamp: number): boolean {
    return (timeStamp + this.oneHour) < this.currentTime;
  }

  getApiKey() {
    return this.hasApiKey() ? this.getLatestNews().apiKey : false;
  }

  hasApiKey() {
    return this.getLatestNews().apiKey ? true : false;
  }

  async fetchLatestNews(skipTimeCheck: boolean = false) {
    if (!this.hasApiKey()) {
      return;
    }

    const news = this.getLatestNews();

    if (skipTimeCheck) {
      return await this.sendRequest();
    } else if (this.checkTime(news.ts)) {
      return await this.sendRequest();
    }
  }

  async sendRequest() {
    const response: NewsType = await this.messageService.fetchLatestNews({
      endpoint: this.endpoints.business + this.getApiKey()
    });
    
    if (response?.status === 'ok') {
      const saved = { ts: this.currentTime, articles: response.articles, apiKey: this.getLatestNews().apiKey };
      this.setLatestNews(saved);
      this.messageService.set(StorageType.News, saved);
      this.messageService.log(`Updated news at: ${this.timeUTCString}`, 1);
    } else {
      this.messageService.log('Failed to fetch news articles.', 1);
    }

    return response;
  }
}
