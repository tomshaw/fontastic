import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PresentationService } from '@app/core/services';
import { CustomThemeModel } from '@app/core/model';

@Component({
  selector: 'app-settings-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {

  themes: any[];
  theme: CustomThemeModel;

  constructor(
    private presentationService: PresentationService,
  ) {
    this.themes = presentationService.getThemes();

    this.presentationService._defaultTheme.subscribe((x) => {
      const idx = this.themes.map(item => item.key).indexOf(x);
      if (this.themes[idx]) {
        const theme = this.themes[idx];
        this.theme = new CustomThemeModel(theme.key, theme.title, theme.description);
      }
    });
  }

  ngOnInit(): void {
    const body = document.querySelector('body');
    const attr = body.getAttribute('data-theme');
    const idx = this.themes.map(item => item.key).indexOf(attr);
    if (this.themes[idx]) {
      const theme = this.themes[idx];
      this.theme = new CustomThemeModel(theme.key, theme.title, theme.description);
    }
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const theme: string = target.value;
    this.presentationService.setTheme(theme);
    this.presentationService.setThemeVars(theme);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) { }
  }
}
