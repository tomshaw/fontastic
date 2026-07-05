import { Injectable } from '@angular/core';
import type { Store } from '@main/database/entity/Store.schema';

/**
 * Registers font files with the document on demand. Elements are observed
 * with a shared IntersectionObserver so a font is only fetched once its
 * preview row is about to scroll into view.
 */
@Injectable({ providedIn: 'root' })
export class FontLoaderService {
  private registered = new Set<string>();
  private pending = new WeakMap<Element, Store>();

  private observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const store = this.pending.get(entry.target);
        this.unobserve(entry.target);
        if (store) {
          this.register(store);
        }
      }
    },
    { rootMargin: '200px' },
  );

  observe(element: Element, store: Store) {
    if (this.registered.has(this.key(store))) return;
    this.pending.set(element, store);
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.observer.unobserve(element);
    this.pending.delete(element);
  }

  register(store: Store) {
    const key = this.key(store);
    if (this.registered.has(key)) return;

    const url = `font://${store.file_path}`;
    const fontFace = new FontFace(store.full_name || store.font_family, `url('${url}')`);

    fontFace
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        this.registered.add(key);
      })
      .catch((err) => {
        console.warn(`Failed to load font: ${store.file_name}`, err);
      });
  }

  private key(store: Store): string {
    return `${store.id}-${store.file_path}`;
  }
}
