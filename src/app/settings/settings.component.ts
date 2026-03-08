import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class SettingsComponent {}
