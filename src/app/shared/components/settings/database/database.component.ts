import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConfigService, MessageService, UtilsService } from '@app/core/services';
import { DbConnectionModel } from '@app/core/model';

@Component({
  selector: 'app-settings-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit {

  config: any;

  connections = [];
  drivers = [];

  loggers = [];

  loggingTypes = [{
    key: 'Yes',
    value: true
  }, {
    key: 'No',
    value: false
  }];

  synchronizeTypes = [{
    key: 'Yes',
    value: true
  }, {
    key: 'No',
    value: false
  }];

  screenToggle = false;

  dbConnection: DbConnectionModel = new DbConnectionModel('', '', '', '', '');

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private utils: UtilsService
  ) {
    this.config = this.configService.getConfig();
  }

  ngOnInit(): void {
    if (this.config?.database) {
      this.connections = this.config.database.connections;
      this.drivers = this.config.database.drivers;
    }
  }

  toggleForm(): void {
    this.screenToggle = !this.screenToggle;
  }

  filterBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  deleteConnection(_event: Event, item: any): void {
    if (item.name === 'default') {
      return;
    }

    if (item.enabled) {
      return;
    }

    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to delete this connection?'
    };

    this.messageService.showMessageBox(options).then((res: any) => {
      if (res.response === 0) {
        const result = this.connections.find(x => x.name === item.name);
        if (result) {
          this.connections = this.connections.filter((connection) => connection.name !== result.name);
          this.messageService.deleteDbConnection(result.name).then((connections: any) => this.connections = connections);
        }
      }
    });
  }

  updateConnection(_event: Event, item: any): void {
    if (item?.name === 'default') {
      return;
    }

    const result = this.connections.find(x => x.name === item.name);

    if (result) {
      this.toggleForm();
      this.dbConnection = new DbConnectionModel(result.name, result.title, result.description, result.type, result.database, result.username, result.password, result.host, result.port, result.logging, result.synchronize);
    }
  }

  enableConnection(_event: Event, item: any): void {
    this.messageService.enableDbConnection(item).then(() => this.messageService.reloadWindow());
  }

  testConnection(_event: Event, item: any): void {
    this.messageService.testDbConnection(item).then((result: any) => {
      if (result.type === 'success') {
        //this.alertService.success(result.message);
      } else {
        //this.alertService.error(result.message);
      }
    });
  }

  buttonDisabled(isValid: boolean) {
    return (isValid) ? null : true;
  }

  handleReset(_event: Event): void {
    this.toggleForm();
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    const values = form.value;
    if (values?.name === 'default') {
      return;
    }

    const isUpdate = (values?.name !== '') ? true : false;
    values.name = (isUpdate) ? values.name : this.utils.randomString(5).toUpperCase();

    this.messageService.createDbConnection(values).then((result: any) => {
      this.connections = result;
      this.toggleForm();
    });

    //this.alertService.success((isUpdate) ? 'Successfully updated connection.' : 'Successfully created connection.');
  }
}
