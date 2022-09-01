import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { MessageService } from '../message/message.service';
import { AlertService } from '../alert/alert.service';
import { LatestNewsModel } from '@app/core/model/LatestNewsModel';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  oneHour = 60 * 60 * 1000;
  currentTime = new Date().getTime();

  endpoints: any = {
    sources: 'https://newsapi.org/v2/top-headlines/sources?country=us&apiKey=',
    articles: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=',
    business: 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey='
  };

  _latestNews = new BehaviorSubject(new LatestNewsModel());
  watchLatestNews$ = this._latestNews.asObservable();

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService
  ) {
    if (this.configService.has('news')) {
      this.setLatestNews(this.configService.get('news'));
    }

    this.refreshLatestNews();
  }

  getLatestNews() {
    return this._latestNews.getValue();
  }

  setLatestNews(items: any = []) {
    this._latestNews.next(items);
  }

  getRequest(url: string) {
    return this.http.get<any>(url);
  }

  checkTime(timeStamp: number): boolean {
    return (timeStamp + this.oneHour) > this.currentTime;
  }

  getApiKey() {
    return this.hasApiKey() ? this.getLatestNews().apiKey : false;
  }

  hasApiKey() {
    return this.getLatestNews().apiKey ? true : false;
  }

  refreshLatestNews(skipTimeCheck: boolean = false) {
    const news = this.getLatestNews();

    if (!this.hasApiKey()) {
      return;
    }

    if (skipTimeCheck) {
      this.fetchNews();
    } else if (this.checkTime(news.ts)) {
      this.fetchNews();
    }
  }

  fetchNews() {
    this.getRequest(this.endpoints.business + this.getApiKey()).pipe(map((data: any) => {
      if (data.status === 'ok') {
        return data;
      }
    })).subscribe({
      complete: () => {
        this.messageService.log('Updating latest news articles.', 1);
      },
      error: (error) => {
        const saved = { ts: this.currentTime, ...this.getLatestNews() };
        this.messageService.set('news', saved);
        this.alertService.warning(error.message);
      },
      next: (response) => {
        const saved = { ts: this.currentTime, articles: response.articles, ...this.getLatestNews() };
        this.setLatestNews(saved);
        this.messageService.set('news', saved);
        this.alertService.success('Fetching news articles.');
      }
    });
  }
}
