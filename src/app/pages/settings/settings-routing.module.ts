import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LayoutService } from '../../layout/layout.service';

import { SettingsComponent } from './settings.component';
import { GeneralComponent } from './forms/general/general.component';
import { DatabaseComponent } from './forms/database/database.component';
import { SynchComponent } from './forms/synch/synch.component';
import { ThemeComponent } from './forms/theme/theme.component';
import { NewsComponent } from './forms/news/news.component';
import { LogsComponent } from './forms/logs/logs.component';
import { SystemComponent } from './forms/system/system.component';

const settingsModuleRoutes: Routes = [{
  path: 'settings',
  component: SettingsComponent,
  children: [{ 
    path: '', 
    redirectTo: 'general', 
    pathMatch: 'full' 
  }, {
    path: 'general',
    component: GeneralComponent
  }, {
    path: 'database',
    component: DatabaseComponent
  }, {
    path: 'synch',
    component: SynchComponent
  }, {
    path: 'theme',
    component: ThemeComponent
  }, {
    path: 'news',
    component: NewsComponent
  }, {
    path: 'logs',
    component: LogsComponent
  }, {
    path: 'system',
    component: SystemComponent
  }]
}];

const routes: Routes = [
  LayoutService.childRoutes(settingsModuleRoutes)
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class SettingsRoutingModule { }
