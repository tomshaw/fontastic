import { Component, OnInit } from '@angular/core';
import { AlertService } from '@app/core/services';
import { AppAlert } from '@main/types';
import { AlertProps } from '@main/config/alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  alert: AppAlert = AlertProps;
  alertEnabled = false;

  constructor(
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.alertService.getObservable().subscribe((result: AppAlert) => {
      if (result?.message) {
        this.alert = result;
        this.alertEnabled = true;
      } else if (this.alertEnabled) {
        this.alertEnabled = false;
        this.alert = AlertProps;
        this.alertService.clear();
      }
    });
  }

  handleIconClick($event: MouseEvent) {
    this.alertService.clear();
    this.alertEnabled = false;
  }
}
