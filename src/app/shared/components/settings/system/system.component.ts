import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@app/core/services';

@Component({
  selector: 'app-settings-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {

  systemConfig: any;
  systemSettings: any[] = [];

  constructor(
    private configService: ConfigService
  ) {
    this.systemConfig = this.configService.getConfig();
  }

  ngOnInit(): void {
    const systemConfig = (this.systemConfig) ? this.systemConfig.system : {};

    this.systemSettings = Object.entries(systemConfig).reduce((arr, k) => {

      const key: any = k[0];
      let value: any = k[1];

      if (key === 'uptime') {
        value = `Hours: ${value.hours} Minutes: ${value.minutes} Seconds: ${value.seconds}`;
      }

      const item = key.toUpperCase();

      if (value === true || value === false) {
        value = (value === true) ? 'Yes' : 'No';
      }

      arr.push({ key: item, value });

      return arr;
    }, []);
  }
}
