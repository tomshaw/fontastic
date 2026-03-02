import { Component, OnInit } from '@angular/core';
import { AlertService } from '@app/core/services';
import { AppAlert } from '@app/core/interface';

const AlertProps = {
  type: '',
  message: '',
  icon: '',
  class: '',
  keep: false,
  timeout: 10e3 * 3
}

@Component({
  standalone: false,
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  public alert: AppAlert = AlertProps;
  public alertEnabled: boolean = false;

  constructor(
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.alertService.getObservable().subscribe((x: AppAlert) => {
      if (x && x.message) {
        this.alert = x;
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
