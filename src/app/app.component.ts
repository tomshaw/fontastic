import { Component, OnInit, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { delay } from 'rxjs/operators';
import { ConfigService, PresentationService } from './core/services';
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
    private configService: ConfigService,
    private presentationService: PresentationService,
    private el: ElementRef
  ) {
    this.translate.setDefaultLang('en');
    this.presentationService._systemLoading.pipe(delay(2e3)).subscribe(() => this.init());
    this.configService.set('ng-version', this.el.nativeElement.getAttribute('ng-version'));
  }

  ngOnInit(): void {
    const plugins = [ScrollToPlugin];
  }

  init(): void {
    const body = document.querySelector('body');
    body.classList.remove('app-loading');
    body.classList.add('app-loaded');
  }
}
