import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LayoutService } from '../../layout/layout.service';
import { MainComponent } from './main.component';

const mainModuleRoutes: Routes = [{
  path: '',
  redirectTo: '/main',
  pathMatch: 'full'
}, {
  path: 'main',
  component: MainComponent,
}];

const routes: Routes = [
  LayoutService.childRoutes(mainModuleRoutes)
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
export class MainRoutingModule { }
