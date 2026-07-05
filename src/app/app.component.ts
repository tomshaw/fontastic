import { Component, afterNextRender, inject } from '@angular/core';
import { ElectronService } from './core/services';
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

  constructor() {
    if (!APP_CONFIG.production) {
      console.log('APP_CONFIG', APP_CONFIG, this.electronService.isElectron ? 'Run in electron' : 'Run in browser');
    }

    afterNextRender(() => {
      setTimeout(() => {
        document.body.classList.remove('app-loading');
        document.body.classList.add('app-loaded');
      }, 1000);
    });
  }
}
