import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConfigService, BreadcrumbService, MessageService, AlertService } from '@app/core/services';
import { SystemConfig } from '@app/core/interface';

@Component({
  selector: 'app-settings-form-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  apiKey = '';

  constructor(
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService
  ) {

    this.configService._systemConfig.subscribe((result: SystemConfig | any) => {
      if (result?.news?.apiKey) {
        this.apiKey = result.news.apiKey;
      }
    });

    this.breadcrumbService.set([{
      title: 'Dashboard',
      link: '/main'
    }, {
      title: 'System Settings',
      link: '/settings'
    }, {
      title: 'Latest News',
      link: ''
    }]);
  }

  ngOnInit(): void { }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.messageService.set('news', { apiKey: form.value.apiKey }).then((result: any) => {
        this.configService.set('news', result);
        this.messageService.log('Saved News Service API Key.', 1);
        this.alertService.success('Saved News Service API Key.');
      });
    }
  }
}
