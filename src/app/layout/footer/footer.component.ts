import { Component, inject, signal } from '@angular/core';
import { SpinnerComponent } from '../../shared/components';
import { ElectronService, PresentationService } from '../../core/services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly presentation = inject(PresentationService);
  private readonly electron = inject(ElectronService);

  readonly appVersion = signal('');
  readonly electronVersion = signal('');
  readonly chromeVersion = signal('');
  readonly nodeVersion = signal('');

  constructor() {
    if (this.electron.isElectron) {
      const versions = (window as any).process.versions;
      this.electronVersion.set(versions.electron ?? '');
      this.chromeVersion.set(versions.chrome ?? '');
      this.nodeVersion.set(versions.node ?? '');
      this.electron.ipcRenderer.invoke('app:get-version').then((v: string) => this.appVersion.set(v));
    }
  }
}
