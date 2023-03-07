import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConfigService, MessageService, AlertService, NewsService } from '@app/core/services';
import { NewsType, SystemConfig } from '@main/types';
import { StorageType } from '@main/enums';

@Component({
  selector: 'app-settings-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit, OnDestroy {

  apiKey = '';

  constructor(
    private alertService: AlertService,
    private configService: ConfigService,
    private newsService: NewsService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.configService._systemConfig.subscribe((result: SystemConfig) => {
      if (result?.news?.apiKey) {
        this.apiKey = result.news.apiKey;
      }
    });
  }

  ngOnDestroy(): void {
    this.apiKey = '';
  }

  onRefreshLatestNews(_event: Event): void {
    this.newsService.fetchLatestNews(true).then((result: NewsType) => {
      if (result?.articles?.length) {
        this.alertService.success(`Successfully fetched ${result.articles.length} latest news articles!`);
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.messageService.set(StorageType.News, { apiKey: form.value.apiKey }).then((result: NewsType) => {
        this.configService.set(StorageType.News, result);
        this.messageService.log('Saved News Service API Key.', 1);
        this.alertService.success('Saved News Service API Key.');
      });
    }
  }
}
