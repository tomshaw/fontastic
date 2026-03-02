import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { BreadcrumbService, PresentationService, MessageService } from '@app/core/services';

import { CustomTheme } from '@app/core/model';

@Component({
  standalone: false,
  selector: 'settings-form-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {

  themes: any[];
  theme = new CustomTheme('', '', '');

  constructor(
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private presentationService: PresentationService,
  ) {

    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }, {
      title: "Theme Settings",
      link: ""
    }]);

    this.themes = presentationService.getThemes();

    this.presentationService._defaultTheme.subscribe((theme) => {
      let idx = this.themes.map(item => item.key).indexOf(theme);
      if (this.themes[idx]) {
        let theme = this.themes[idx];
        this.theme = new CustomTheme(theme.key, theme.title, theme.description);
      }
    });
  }

  ngOnInit(): void {
    const body = document.querySelector('body')!;
    let attr = body.getAttribute('data-theme');
    let idx = this.themes.map(item => item.key).indexOf(attr);
    if (this.themes[idx]) {
      let theme = this.themes[idx];
      this.theme = new CustomTheme(theme.key, theme.title, theme.description);
    }
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const theme = target.value;
    this.presentationService.setTheme(theme);
    this.presentationService.setThemeDefaults(theme);
    this.messageService.log(`Switched theme to ${theme}.`, 1);
    //this.alertService.info(`Switched theme to ${theme}.`, true);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      let data = form.value;
    }
  }

}
