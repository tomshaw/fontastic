import { Component, OnInit } from '@angular/core';
import { ConfigService, BreadcrumbService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'settings-form-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {

  config: any;
  system: any[] = [];

  constructor(
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.config = this.configService.getConfig();

    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }, {
      title: "System Information",
      link: ""
    }]);
  }

  ngOnInit(): void {

    this.system = Object.entries(this.config.system).reduce((arr: {key: any, value: any}[], k) => {

      let key: any = k[0];
      let value: any = k[1];
      
      if (key === 'uptime') {
        value = `Hours: ${value.hours} Minutes: ${value.minutes} Seconds: ${value.seconds}`
      }
      
      let item = key.toUpperCase();

      if (value === true || value === false) {
        value = (value === true) ? 'Yes' : 'No';
      }

      arr.push({ key: item, value })
      
      return arr;
    }, [] as {key: any, value: any}[]);
  }

}
