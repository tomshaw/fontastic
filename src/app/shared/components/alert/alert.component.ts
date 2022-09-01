import { Component, OnInit } from '@angular/core';
import { AlertService } from '@app/core/services';
import { AppAlert } from '@app/core/interface';
import { AlertProps } from '@main/config/alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  public alert: AppAlert = AlertProps;
  public alertEnabled = false;

  constructor(
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.alertService.getObservable().subscribe((ev: AppAlert) => {
      if (ev && ev.message) {
        this.alert = ev;
        this.alertEnabled = true;
      } else {
        this.alertEnabled = false;
        this.alert = AlertProps;
      }
    });
  }

  handleIconClick($event: MouseEvent) {
    this.alertService.clear();
    this.alertEnabled = false;
  }

}
