import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PresentationService } from './core/services';

import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private presentationService: PresentationService,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    document.title = "Electron Font Manager";
    presentationService._systemLoading.subscribe((result) => {
      const body = document.querySelector('body')!;
      setTimeout(() => {
        body.classList.remove('app-loading');
        body.classList.add('app-loaded');
      }, 1e3);
    });
  }

  ngOnInit() {
    // Prevent tree shaking
    const plugins = [ScrollToPlugin];
  }

}
