import { Component, inject, effect, ElementRef } from '@angular/core';
import { DatabaseService, MessageService } from '../../../core/services';

@Component({
  selector: 'app-datagrid',
  standalone: true,
  templateUrl: './datagrid.component.html',
})
export class DatagridComponent {
  readonly db = inject(DatabaseService);
  private messageService = inject(MessageService);
  private el = inject(ElementRef);

  readonly sortableColumns = [
    { field: 'full_name', label: 'Name' },
    { field: 'font_family', label: 'Family' },
    { field: 'font_subfamily', label: 'Style' },
    { field: 'file_type', label: 'Type' },
    { field: 'file_size', label: 'Size' },
    { field: 'version', label: 'Version' },
    { field: 'designer', label: 'Designer' },
  ];

  constructor() {
    effect(() => {
      this.db.currentPage();
      const scrollable = this.el.nativeElement.querySelector('.scrollbox-y');
      scrollable?.scrollTo(0, 0);
    });
  }

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
