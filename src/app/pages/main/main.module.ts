import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { GridComponent } from './grid/grid.component';
import { PreviewComponent } from './preview/preview.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { InspectComponent } from './inspect/inspect.component';
import { GlyphsComponent } from './glyphs/glyphs/glyphs.component';
import { WaterfallComponent } from './waterfall/waterfall/waterfall.component';
import { ArticleComponent } from './article/article/article.component';

@NgModule({
  declarations: [
    MainComponent, 
    GridComponent, 
    PreviewComponent, 
    ToolbarComponent, 
    InspectComponent, GlyphsComponent, WaterfallComponent, ArticleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MainRoutingModule
  ]
})
export class MainModule { }
