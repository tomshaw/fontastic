import { Component, OnInit, Input } from '@angular/core';
import { MessageService, NewsService } from '@app/core/services';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  @Input() fontObject: any;
  @Input() fontFamily: string;
  @Input() fontColor: string;
  @Input() latestNews: any;

  selectedNews: any;
  textContent: any;

  fontScale = [
    {
      key: 'prose-sm',
      value: '0.875rem (14px)'
    },
    {
      key: 'prose-base',
      value: '1rem (16px)'
    },
    {
      key: 'prose-lg',
      value: '1.125rem (18px)'
    },
    {
      key: 'prose-xl',
      value: '1.25rem (20px)'
    },
    {
      key: 'prose-2xl',
      value: '1.5rem (24px)'
    }
  ];

  fontScaleSelected = this.fontScale[4].key;

  constructor(
    private newsService: NewsService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    if (this.latestNews.length) {
      this.latestNews = this.latestNews;
      this.selectedNewsArticle();
      this.updateTextContent(this.selectedNews.url);
    }
  }

  onUpdateNewsArticle(event: Event): void {
    this.selectedNewsArticle();
    this.updateTextContent(this.selectedNews.url);
  }

  onRefreshLatestNews(event: Event): void {
    this.newsService.refreshLatestNews(true);
  }

  selectedNewsArticle(): void {
    this.selectedNews = this.latestNews[Math.floor(Math.random() * this.latestNews.length)];
    console.log('selectedNews', this.selectedNews);
  }

  updateTextContent(url: string): void {
    this.messageService.fetchNewsContent(url).then((response: any) => this.textContent = response?.textContent);
  }

  onSelectFontScale(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.fontScaleSelected = target.value;
  }

}
