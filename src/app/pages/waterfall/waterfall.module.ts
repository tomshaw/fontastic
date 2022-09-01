import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallRoutingModule } from './waterfall-routing.module';
import { WaterfallComponent } from './waterfall.component';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    WaterfallRoutingModule
  ]
})

export class WaterfallModule { }
