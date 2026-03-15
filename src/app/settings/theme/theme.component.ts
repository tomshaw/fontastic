import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresentationService } from '../../core/services';

@Component({
  selector: 'app-settings-theme',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './theme.component.html',
})
export class SettingsThemeComponent {
  readonly presentation = inject(PresentationService);

  readonly themes = PresentationService.themes.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  onThemeChange(value: string) {
    this.presentation.theme.set(value);
  }

  onAutoThemeChange(enabled: boolean) {
    this.presentation.setAutoTheme(enabled);
  }
}
