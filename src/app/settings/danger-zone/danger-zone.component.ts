import { Component, inject } from '@angular/core';
import { MessageService } from '../../core/services';

@Component({
  selector: 'app-settings-danger-zone',
  standalone: true,
  templateUrl: './danger-zone.component.html',
})
export class SettingsDangerZoneComponent {
  private readonly message = inject(MessageService);

  async onDropDatabase() {
    const response = await this.message.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to drop the database?',
    });
    if (response?.response === 0) {
      await this.message.dropDatabase();
      this.message.reloadWindow();
    }
  }

  async onClearStore() {
    const response = await this.message.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to delete the application store?',
    });
    if (response?.response === 0) {
      await this.message.clearStore();
      this.message.reloadWindow();
    }
  }

  async onClearCache() {
    const response = await this.message.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to clear the application cache?',
    });
    if (response?.response === 0) {
      await this.message.clearCache();
    }
  }
}
