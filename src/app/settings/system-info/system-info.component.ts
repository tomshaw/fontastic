import { Component, inject, signal, OnInit } from '@angular/core';
import { MessageService } from '../../core/services';
import { ChannelType } from '@main/enums';
import type { SystemType } from '@main/types';

@Component({
  selector: 'app-settings-system-info',
  standalone: true,
  templateUrl: './system-info.component.html',
})
export class SettingsSystemInfoComponent implements OnInit {
  private readonly message = inject(MessageService);

  readonly systemSettings = signal<{ key: string; value: string }[]>([]);

  ngOnInit() {
    this.message.once(ChannelType.IPC_RESPONSE_SYSTEM_BOOT, (_event: any, config: any) => {
      if (!config?.system) return;

      const entries = Object.entries(config.system).map(([key, value]) => {
        let display: string;
        if (key === 'uptime') {
          const u = value as SystemType['uptime'];
          display = `${u.hours}h ${u.minutes}m ${u.seconds}s`;
        } else if (typeof value === 'boolean') {
          display = value ? 'Yes' : 'No';
        } else if (typeof value === 'object' && value !== null) {
          display = Object.entries(value as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        } else {
          display = String(value);
        }
        return { key: key.replace(/_/g, ' ').toUpperCase(), value: display };
      });

      this.systemSettings.set(entries);
    });

    this.message.send(ChannelType.IPC_REQUEST_SYSTEM_BOOT);
  }
}
