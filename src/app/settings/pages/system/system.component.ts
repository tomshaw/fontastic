import { Component } from '@angular/core';
import { SettingsSystemInfoComponent } from '../../system-info/system-info.component';

@Component({
  selector: 'app-settings-system-page',
  standalone: true,
  imports: [SettingsSystemInfoComponent],
  templateUrl: './system.component.html',
})
export class SettingsSystemPageComponent {}
