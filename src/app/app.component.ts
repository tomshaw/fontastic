import { Component, afterNextRender, inject } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent {
  private electronService = inject(ElectronService);
  private translate = inject(TranslateService);

  constructor() {
    const electronService = this.electronService;

    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
      void this.electronService.ipcRenderer.invoke('app:get-version').then((v) => console.log('App version:', v));
    } else {
      console.log('Run in browser');
    }

    afterNextRender(() => {
      setTimeout(() => {
        document.body.classList.remove('app-loading');
        document.body.classList.add('app-loaded');
      }, 1000);
    });
  }
}
