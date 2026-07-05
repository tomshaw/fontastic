import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';
import { FontLoaderService } from '../../../core/services/font-loader/font-loader.service';
import type { Store } from '@main/database/entity/Store.schema';

/** Loads the given store's font file when the host element nears the viewport. */
@Directive({
  selector: '[appLazyFont]',
  standalone: true,
})
export class LazyFontDirective implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private fontLoader = inject(FontLoaderService);

  readonly appLazyFont = input.required<Store>();

  ngOnInit() {
    this.fontLoader.observe(this.el.nativeElement, this.appLazyFont());
  }

  ngOnDestroy() {
    this.fontLoader.unobserve(this.el.nativeElement);
  }
}
