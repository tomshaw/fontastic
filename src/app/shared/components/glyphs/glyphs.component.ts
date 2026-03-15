import { Component, inject, signal, computed, effect } from '@angular/core';
import { DatabaseService, PresentationService } from '../../../core/services';
import { DisabledOpacityDirective } from '../../directives/disabled-opacity/disabled-opacity.directive';
import { HoverHighlightDirective } from '../../directives/hover-highlight/hover-highlight.directive';

const PAGE_SIZE = 200;

@Component({
  selector: 'app-glyphs',
  standalone: true,
  imports: [HoverHighlightDirective, DisabledOpacityDirective],
  templateUrl: './glyphs.component.html',
})
export class GlyphsComponent {
  readonly db = inject(DatabaseService);
  private readonly presentation = inject(PresentationService);

  readonly currentPage = signal(1);
  readonly selectedGlyph = this.presentation.selectedGlyph;

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
    // Reset selection when user switches to a different font.
    // Skip the null → savedId transition on startup (restore, not a switch).
    let lastStoreId: number | null = null;
    effect(() => {
      const storeId = this.db.storeId();
      if (lastStoreId !== null && storeId !== lastStoreId) {
        this.currentPage.set(1);
        this.presentation.selectedGlyph.set(null);
      }
      lastStoreId = storeId;
    });

    // Navigate to the correct page for the restored/selected glyph.
    effect(() => {
      const glyphs = this.db.glyphs();
      const selected = this.presentation.selectedGlyph();
      if (selected !== null && glyphs.length) {
        const index = glyphs.indexOf(selected);
        if (index >= 0) {
          this.currentPage.set(Math.floor(index / PAGE_SIZE) + 1);
        }
      }
    });
  }

  toChar(codePoint: number): string {
    return String.fromCodePoint(codePoint);
  }
}
