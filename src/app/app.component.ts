import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { delay } from 'rxjs/operators';
import { PresentationService } from './core/services';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    private presentationService: PresentationService
  ) {
    this.translate.setDefaultLang('en');
    this.presentationService._systemLoading.pipe(delay(2e3)).subscribe((x) => this.init(x));
  }

  ngOnInit() {
    const plugins = [ScrollToPlugin];
  }

  init(x: boolean) {
    const body = document.querySelector('body');
    body.classList.remove('app-loading');
    body.classList.add('app-loaded');
  }

}
