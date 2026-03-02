import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertService, ConfigService, BreadcrumbService, MessageService, UtilsService } from '@app/core/services';
import { DatabaseConnection } from '@app/core/model';

@Component({
  standalone: false,
  selector: 'settings-form-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit {

  config: any;

  connections: any[] = [];
  connectionTypes: any[] = [];

  loggers: any[] = [];

  loggingTypes: any[] = [{
    key: 'Yes',
    value: true
  }, {
    key: 'No',
    value: false
  }];

  synchronizeTypes: any[] = [{
    key: 'Yes',
    value: true
  }, {
    key: 'No',
    value: false
  }];

  screenToggle: boolean = false;

  db = new DatabaseConnection('', '', '', '', '');

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
      this.connectionTypes = this.config.database.connectionTypes;
    }

    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }, {
      title: "Database Management",
      link: ""
    }]);
  }

  toggleForm(): void {
    this.screenToggle = !this.screenToggle;
  }

  filterBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  deleteConnection(event: any, item: any): void {
    if (item && item.name === 'default') return;
    
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to delete this connection?'
    };

    this.messageService.showMessageBox(options).then((res: any) => {
      if (res.response == 0) {
        let result = this.connections.find(x => x.name === item.name);
        if (result) {
          this.connections = this.connections.filter((item) => item.name !== result.name);
          this.messageService.deleteDbConnection(result.name).then((result: any) => {
            this.connections = result;
          });
        }
      }
    });
  }

  updateConnection(event: any, item: any): void {
    if (item && item.name === 'default') return;

    let result = this.connections.find(x => x.name === item.name);

    if (result) {
      this.toggleForm();
      this.db = new DatabaseConnection(result.name, result.title, result.description, result.type, result.database, result.username, result.password, result.host, result.port, result.logging, result.synchronize);
    }
  }

  enableConnection(event: any, item: any): void {
    this.messageService.enableDbConnection(item).subscribe((result: any) => {
      setTimeout(() => {
        this.messageService.reloadWindow();
      }, 5e3);
      this.alertService.info('Applying changes please wait..', true);
    });
  }

  testConnection(event: any, item: any): void {
    this.messageService.testDbConnection(item).then((result: any) => {
      if (result.type === 'success') {
        this.alertService.success(result.message, false, 1e3);
      } else {
        this.alertService.error(result.message, false, 1e3);
      }
    });
  }

  buttonDisabled(isValid: boolean) {
    return (isValid) ? null : true;
  }

  handleReset(event: any): void {
    this.toggleForm();
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      
      let formValue = form.value;
      console.log('form-value', formValue);
      
      if (formValue && formValue.name === 'default') return;

      let isUpdate = (formValue.name && formValue.name !== '') ? true : false;

      if (isUpdate) {
        let result = this.connections.find(x => x.name === formValue.name);

        // Prevent 
        if (result && result.name === 'default') return;
        
        this.messageService.saveDbConnection(formValue).then((result: any) => {
          this.connections = result;
          this.toggleForm();
        });

        this.alertService.success('Successfully updated connection.', true);

      } else {
        formValue.name = this.utils.randomString(5).toUpperCase();

        this.messageService.saveDbConnection(formValue).then((result: any) => {
          this.connections = result;
          this.toggleForm();
        });

        this.alertService.success('Successfully created connection.', true);
      }
    }
  }
}
