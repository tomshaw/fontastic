import { Component, inject, signal, computed, effect } from '@angular/core';
import { DatabaseService } from '../../../core/services';

const PAGE_SIZE = 200;

@Component({
  selector: 'app-inspector',
  standalone: true,
  templateUrl: './inspector.component.html',
})
export class InspectorComponent {
  readonly db = inject(DatabaseService);

  readonly currentPage = signal(1);
  readonly selectedGlyph = signal<number | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.db.glyphs().length / PAGE_SIZE)));

  readonly pageGlyphs = computed(() => {
    const glyphs = this.db.glyphs();
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return glyphs.slice(start, start + PAGE_SIZE);
  });

  readonly fontFamily = computed(() => {
    const store = this.db.store();
    return store ? store.full_name || store.font_family || '' : '';
  });

  constructor() {
    effect(() => {
      this.db.glyphs();
      this.currentPage.set(1);
      this.selectedGlyph.set(null);
    });
  }

  toChar(codePoint: number): string {
    return String.fromCodePoint(codePoint);
  }
}
