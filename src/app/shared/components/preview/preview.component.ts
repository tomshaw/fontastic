import { Component, inject, effect } from '@angular/core';
import { DatabaseService, MessageService, PresentationService } from '../../../core/services';
import { ScrollResetDirective } from '../../directives/scroll-reset/scroll-reset.directive';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [ScrollResetDirective],
  templateUrl: './preview.component.html',
})
export class PreviewComponent {
  readonly db = inject(DatabaseService);
  readonly presentation = inject(PresentationService);
  private messageService = inject(MessageService);

  private registeredFonts = new Set<string>();

  constructor() {
    effect(() => {
      const stores = this.db.stores();
      if (stores) {
        stores.forEach((store) => this.registerFont(store));
      }
    });
  }

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

  private registerFont(store: any) {
    const key = `${store.id}-${store.file_path}`;
    if (this.registeredFonts.has(key)) return;

    const url = `font://${store.file_path}`;
    const fontFace = new FontFace(store.full_name || store.font_family, `url('${url}')`);

    fontFace
      .load()
      .then((loaded) => {
        (document as any).fonts.add(loaded);
        this.registeredFonts.add(key);
      })
      .catch((err) => {
        console.warn(`Failed to load font: ${store.file_name}`, err);
      });
  }
}
