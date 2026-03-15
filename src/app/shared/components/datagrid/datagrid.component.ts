import { Component, inject } from '@angular/core';
import { DatabaseService, MessageService } from '../../../core/services';
import { DisabledOpacityDirective } from '../../directives/disabled-opacity/disabled-opacity.directive';
import { HoverHighlightDirective } from '../../directives/hover-highlight/hover-highlight.directive';
import { ScrollResetDirective } from '../../directives/scroll-reset/scroll-reset.directive';
import { StopPropagationDirective } from '../../directives/stop-propagation/stop-propagation.directive';

@Component({
  selector: 'app-datagrid',
  standalone: true,
  imports: [HoverHighlightDirective, StopPropagationDirective, DisabledOpacityDirective, ScrollResetDirective],
  templateUrl: './datagrid.component.html',
})
export class DatagridComponent {
  readonly db = inject(DatabaseService);
  private messageService = inject(MessageService);

  readonly sortableColumns = [
    { field: 'full_name', label: 'Name' },
    { field: 'font_family', label: 'Family' },
    { field: 'font_subfamily', label: 'Style' },
    { field: 'file_type', label: 'Type' },
    { field: 'file_size', label: 'Size' },
    { field: 'version', label: 'Version' },
    { field: 'designer', label: 'Designer' },
  ];

  selectStore(id: number) {
    this.db.storeId.set(id);
    document.getElementById('preview-store-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  toggleFavorite(event: Event, store: any) {
    event.stopPropagation();
    const newValue = store.favorite ? 0 : 1;
    this.db.storeUpdate(store.id, { favorite: newValue }).then(() => {
      this.db.stores.update((stores) => stores.map((s) => (s.id === store.id ? { ...s, favorite: newValue } : s)));
      this.db.fetchSystemStats();
    });
  }

  openFileLocation(event: Event, store: any) {
    event.stopPropagation();
    if (store?.file_path) {
      this.messageService.showItemInFolder(store.file_path);
    }
  }

  openFileViewer(event: Event, store: any) {
    event.stopPropagation();
    if (store?.file_path) {
      this.messageService.openPath(store.file_path);
    }
  }
}
