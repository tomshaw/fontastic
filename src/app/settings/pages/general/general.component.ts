import { Component } from '@angular/core';
import { SettingsThemeComponent } from '../../theme/theme.component';
import { SettingsAiKeysComponent } from '../../ai-keys/ai-keys.component';
import { SettingsNewsApiComponent } from '../../news-api/news-api.component';
import { SettingsQuickActionsComponent } from '../../quick-actions/quick-actions.component';
import { SettingsDangerZoneComponent } from '../../danger-zone/danger-zone.component';

@Component({
  selector: 'app-settings-general-page',
  standalone: true,
  imports: [
    SettingsThemeComponent,
    SettingsAiKeysComponent,
    SettingsNewsApiComponent,
    SettingsQuickActionsComponent,
    SettingsDangerZoneComponent,
  ],
  templateUrl: './general.component.html',
})
export class SettingsGeneralPageComponent {}
