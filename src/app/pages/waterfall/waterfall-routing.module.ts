import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LayoutService } from '../../layout/layout.service';
import { WaterfallComponent } from './waterfall.component';

const routes: Routes = [
  LayoutService.childRoutes([
    { path: '', redirectTo: '/waterfall', pathMatch: 'full' },
    { path: 'waterfall', component: WaterfallComponent, data: { title: 'Waterfall' } }
  ])
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WaterfallRoutingModule { }
