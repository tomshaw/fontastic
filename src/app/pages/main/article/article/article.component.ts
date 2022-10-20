import { Component, OnInit, Input } from '@angular/core';
import { MessageService, NewsService } from '@app/core/services';
import { proseFontScale } from '@main/config/system';

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

  proseFontScale = proseFontScale;
  proseFontScaleSelect = 'prose-2xl';

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
  }

  updateTextContent(url: string): void {
    this.messageService.fetchNewsContent(url).then((response: any) => this.textContent = response?.textContent);
  }

  onSelectProseScale(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.proseFontScaleSelect = target.value;
  }

}
