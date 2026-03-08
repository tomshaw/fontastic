import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService } from '../../core/services';
import type { Logger } from '@main/database/entity/Logger.schema';

@Component({
  selector: 'app-settings-logs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './logs.component.html',
})
export class SettingsLogsComponent implements OnInit {
  private readonly message = inject(MessageService);

  readonly logs = signal<Logger[]>([]);

  async ngOnInit() {
    await this.loadLogs();
  }

  async loadLogs() {
    const result = await this.message.loggerFind({ order: { id: 'DESC' } });
    this.logs.set(result);
  }

  filterMessageType(type: number): string {
    return type === 1 ? 'System Action' : 'User Action';
  }

  filterMessageStatus(status: number): string {
    return status === 1 ? 'Error' : 'Success';
  }

  async onDeleteLog(id: number) {
    await this.message.loggerDelete(id);
    await this.loadLogs();
  }

  async onTruncateLogs() {
    await this.message.loggerTruncate();
    await this.loadLogs();
  }
}
