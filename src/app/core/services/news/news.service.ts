import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { MessageService } from '../message/message.service';
import { AlertService } from '../alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  oneHour = 60 * 60 * 1000;
  currentTime = new Date().getTime();

  //endpoint: string = 'https://newsapi.org/v2/top-headlines/sources?country=us&apiKey=';
  endpoint: string = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=';

  newsConfig: any = {};

  private _latestNews = new BehaviorSubject<any[]>([]);
  watchLatestNews$ = this._latestNews.asObservable();

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService
  ) {
    if (!this.configService.has('news')) {
      return;
    }

    this.newsConfig = this.configService.get('news');

    this.handleLatestNews();
  }

  getRequest(url: string) {
    return this.http.get<any>(url);
  }

  getLatestNews() {
    return this._latestNews.getValue();
  }

  setLatestNews(items: any = []) {
    this._latestNews.next(items);
  }

  checkTime(timeStamp: number): boolean {
    return (timeStamp + this.oneHour) > this.currentTime;
  }

  handleLatestNews(skipTimeCheck: boolean = false) {
    const news = this.newsConfig;
    console.log('NEWS CONFIG', news);

    let ts = (news && news.ts) ? news.ts : false;
    let articles = (news && news.articles && news.articles.length) ? news.articles : false;

    if (skipTimeCheck) {
      this.fetchNews();
    } else {
      if (ts && articles) {
        if (this.checkTime(ts)) {
          this.fetchNews()
        } else {
          this.setLatestNews(articles);
        }
      } else if (ts) {
        if (this.checkTime(ts)) {
          this.fetchNews()
        }
      }
    }
  }

  fetchNews() {
    this.getRequest(this.endpoint + this.newsConfig.apiKey).pipe(map((data: any) => {
      if (data.status === 'ok') {
        return data;
      }
    })).subscribe({
      complete: () => {
        this.messageService.log('Updating latest news articles.', 1);
      },
      error: (error) => {
        let saved = { ts: this.currentTime, ...this.newsConfig }
        this.messageService.set('news', saved);
        this.alertService.warning(error.message, false);
      },
      next: (response) => {
        this.alertService.success('Fetching news articles.', false);
        console.log('fetch-news-response-refresh', response);
        this.setLatestNews(response);
        let saved = { ts: this.currentTime, articles: response.articles, ...this.newsConfig }
        this.messageService.set('news', saved);
      }
    });
  }

}
