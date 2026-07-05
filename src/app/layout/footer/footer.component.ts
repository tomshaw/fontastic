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
    const bridge = this.electron.bridge;
    if (bridge) {
      this.electronVersion.set(bridge.versions.electron);
      this.chromeVersion.set(bridge.versions.chrome);
      this.nodeVersion.set(bridge.versions.node);
      bridge.invoke<string>('app:get-version').then((v) => this.appVersion.set(v));
    }
  }
}
