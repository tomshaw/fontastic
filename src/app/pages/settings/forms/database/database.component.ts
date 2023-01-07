import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertService, ConfigService, BreadcrumbService, MessageService, UtilsService } from '@app/core/services';
import { DbConnectionModel } from '@app/core/model';

@Component({
  selector: 'app-settings-form-database',
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
    private alertService: AlertService,
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private utils: UtilsService
  ) {
    this.config = this.configService.getConfig();
  }

  ngOnInit(): void {

    if (this.config.database) {
      this.connections = this.config.database.connections;
      this.drivers = this.config.database.drivers;
    }

    this.breadcrumbService.set([{
      title: 'Dashboard',
      link: '/main'
    }, {
      title: 'System Settings',
      link: '/settings'
    }, {
      title: 'Database Management',
      link: ''
    }]);
  }

  toggleForm(): void {
    this.screenToggle = !this.screenToggle;
  }

  filterBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  deleteConnection(event: any, item: any): void {
    if (item.name === 'default') {
      this.alertService.error('Cannot delete default database connection.');
      return;
    }

    if (item.enabled) {
      this.alertService.error('Cannot delete enabled database connection.');
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

  updateConnection(event: Event, item: any): void {
    if (item?.name === 'default') {
      return;
    }

    const result = this.connections.find(x => x.name === item.name);

    if (result) {
      this.toggleForm();
      this.dbConnection = new DbConnectionModel(result.name, result.title, result.description, result.type, result.database, result.username, result.password, result.host, result.port, result.logging, result.synchronize);
    }
  }

  enableConnection(event: Event, item: any): void {
    this.messageService.enableDbConnection(item).then((result: any) => {
      setTimeout(() => this.messageService.reloadWindow(), 5e3);
      this.alertService.info('Applying changes please wait..');
    });
  }

  testConnection(event: Event, item: any): void {
    this.messageService.testDbConnection(item).then((result: any) => {
      if (result.type === 'success') {
        this.alertService.success(result.message);
      } else {
        this.alertService.error(result.message);
      }
    });
  }

  buttonDisabled(isValid: boolean) {
    return (isValid) ? null : true;
  }

  handleReset(event: Event): void {
    this.toggleForm();
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    const options = form.value;

    if (options?.name === 'default') {
      return;
    }

    const isUpdate = (options?.name !== '') ? true : false;

    options.name = (isUpdate) ? options.name : this.utils.randomString(5).toUpperCase();

    this.messageService.saveDbConnection(options).then((res: any) => {
      this.connections = res;
      this.toggleForm();
    });

    this.alertService.success((isUpdate) ? 'Successfully updated connection.' : 'Successfully created connection.');
  }
}
