import { Component, inject } from '@angular/core';

import { PanelComponent } from '../../shared/components/panel/panel.component';
import { PreviewComponent } from '../../shared/components/preview/preview.component';
import { DatagridComponent } from '../../shared/components/datagrid/datagrid.component';
import { ToolbarComponent } from '../../shared/components/toolbar/toolbar.component';
import { GlyphsComponent } from '../../shared/components/glyphs/glyphs.component';
import { SearchComponent } from '../../shared/components/search/search.component';
import { WaterfallComponent } from '../../shared/components/waterfall/waterfall.component';
import { PresentationService } from '../../core/services';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [PanelComponent, PreviewComponent, DatagridComponent, ToolbarComponent, GlyphsComponent, SearchComponent, WaterfallComponent],
  templateUrl: './main.component.html',
})
export class MainComponent {
  readonly presentation = inject(PresentationService);
}
