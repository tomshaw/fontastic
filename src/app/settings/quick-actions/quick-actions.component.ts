import { Component, inject, signal } from '@angular/core';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { DatabaseService, MessageService } from '../../core/services';

@Component({
  selector: 'app-settings-quick-actions',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './quick-actions.component.html',
})
export class SettingsQuickActionsComponent {
  private readonly database = inject(DatabaseService);
  private readonly message = inject(MessageService);

  readonly syncing = signal(false);

  async onResetFavorites() {
    await this.database.resetFavorites();
    await this.database.fetchSystemStats();
  }

  async onSyncSystemFonts() {
    this.syncing.set(true);
    try {
      await this.database.syncSystemFonts();
    } finally {
      this.syncing.set(false);
    }
  }

  onRestartApp() {
    this.message.beep();
    this.message.reloadWindow();
  }

  onExitApp() {
    this.message.beep();
    this.message.quitApplication();
  }
}
