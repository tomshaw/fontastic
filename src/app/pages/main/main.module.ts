import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MainRoutingModule } from './main-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { MainComponent } from './main.component';
import { GridComponent } from './grid/grid.component';
import { PreviewComponent } from './preview/preview.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { InspectComponent } from './inspect/inspect.component';

@NgModule({
  declarations: [
    MainComponent, 
    GridComponent, 
    PreviewComponent, 
    ToolbarComponent, 
    InspectComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MainRoutingModule
  ]
})
export class MainModule { }
