import { Component, inject } from '@angular/core';
import { DatabaseService, MessageService, PresentationService } from '../../../core/services';
import { ScrollResetDirective } from '../../directives/scroll-reset/scroll-reset.directive';
import { LazyFontDirective } from '../../directives/lazy-font/lazy-font.directive';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [ScrollResetDirective, LazyFontDirective],
  templateUrl: './preview.component.html',
})
export class PreviewComponent {
  readonly db = inject(DatabaseService);
  readonly presentation = inject(PresentationService);
  private messageService = inject(MessageService);

  selectStore(id: number) {
    this.db.storeId.set(id);
    document.getElementById('grid-store-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
