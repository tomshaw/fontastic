import { Component, OnInit } from '@angular/core';
import { MessageService } from '@app/core/services';
import { Logger } from '@main/database/entity/Logger.schema';

@Component({
  selector: 'app-settings-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  resultSet: Logger[] = [];

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.messageService.loggerFind({ order: { id: 'DESC' }}).then((result: Logger[]) => this.resultSet = result);
  }

  filterMessageType(type: number): string {
    return (type === 1) ? 'System Action' : 'User Action';
  }

  filterMessageStatus(type: number): string {
    return (type === 1) ? 'Error' : 'Success';
  }

  handleDelete(id: number): void {
    this.messageService.loggerDelete(id).then(() => this.ngOnInit());
  }

  handleTruncate(_event: Event): void {
    this.messageService.loggerTruncate().then(() => this.ngOnInit());
  }
}
