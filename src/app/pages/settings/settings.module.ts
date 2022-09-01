import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';

import { SettingsComponent } from './settings.component';
import { NewsComponent } from './forms/news/news.component';
import { ThemeComponent } from './forms/theme/theme.component';
import { GeneralComponent } from './forms/general/general.component';
import { SystemComponent } from './forms/system/system.component';
import { LogsComponent } from './forms/logs/logs.component';
import { DatabaseComponent } from './forms/database/database.component';

@NgModule({
  declarations: [
    SettingsComponent, 
    NewsComponent, 
    ThemeComponent, 
    GeneralComponent, 
    SystemComponent, 
    LogsComponent, 
    DatabaseComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
