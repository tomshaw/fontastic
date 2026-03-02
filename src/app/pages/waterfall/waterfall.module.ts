import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { WaterfallRoutingModule } from './waterfall-routing.module';
import { WaterfallComponent } from './waterfall.component';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    WaterfallRoutingModule
  ]
})

export class WaterfallModule { }
