import { Component } from '@angular/core';
import { SettingsLogsComponent } from '../../logs/logs.component';

@Component({
  selector: 'app-settings-logs-page',
  standalone: true,
  imports: [SettingsLogsComponent],
  templateUrl: './logs.component.html',
})
export class SettingsLogsPageComponent {}
