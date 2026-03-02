import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NewsService, ConfigService, BreadcrumbService, MessageService, AlertService } from '@app/core/services';

import { SystemConfig } from '@app/core/interface';

@Component({
  standalone: false,
  selector: 'settings-form-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  apiKey: string = '';
  apiUrl: string = '';

  constructor(
    private newsService: NewsService,
    private alertService: AlertService,
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService
  ) {

    this.configService._systemConfig.subscribe((result: SystemConfig | object | any) => {
      console.log('configService._systemConfig', result);
      if (result && result.news && result.news.apiKey) {
        this.apiKey = result.news.apiKey;
        this.apiUrl = result.news.apiUrl;
      }
    });

    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }, {
      title: "Latest News",
      link: ""
    }]);
  }

  ngOnInit(): void {

  }

  buttonDisabled(isValid: boolean) {
    return (isValid) ? null : true;
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      let saved = { apiKey: form.value.apiKey, apiUrl: this.newsService.endpoint };
      this.messageService.set('news', saved).then((result: any) => {
        this.configService.set('news', result);
        this.messageService.log('Saved news service settings.', 1);
        this.alertService.success('Saved news service settings.', false);
      });
    }
  }

}
