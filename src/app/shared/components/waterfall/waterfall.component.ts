import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatabaseService, PresentationService } from '../../../core/services';
import { fontTypeScale } from '@main/config/system';

interface ScaleItem {
  em: number;
  px: string;
  label: string;
  size: string;
  active: boolean;
}

@Component({
  selector: 'app-waterfall',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './waterfall.component.html',
})
export class WaterfallComponent {
  readonly db = inject(DatabaseService);
  readonly presentation = inject(PresentationService);

  readonly scaleOptions = fontTypeScale;

  readonly baseFontSize = signal(16);
  readonly scaleRatio = signal(1.067);
  readonly highScaleLength = signal(6);
  readonly lowScaleLength = signal(3);

  readonly fontFamily = computed(() => {
    const store = this.db.store();
    return store ? store.full_name || store.font_family || '' : '';
  });

  readonly displayText = computed(() => this.presentation.displayText());

  readonly typeScale = computed(() => {
    const ratio = this.scaleRatio();
    const baseMultiplier = this.baseFontSize() / 16;
    const highLen = this.highScaleLength();
    const lowLen = this.lowScaleLength();

    const high = this.buildHighScale(ratio, baseMultiplier, highLen);
    const low = this.buildLowScale(ratio, baseMultiplier, lowLen);

    return [...high.reverse(), ...low];
  });

  private buildHighScale(ratio: number, baseMultiplier: number, length: number): ScaleItem[] {
    let baseSize = 1;
    let result = 1;
    const items: ScaleItem[] = [];

    for (let i = 0; i < length; i++) {
      const em = Math.round(result * 1000) / 1000;
      const px = (baseMultiplier * 16 * result).toFixed(2);
      items.push({
        em,
        px,
        label: em + 'rem/' + px + 'px',
        size: px + 'px',
        active: i === 0,
      });
      result = baseSize * ratio;
      baseSize = result;
    }

    return items;
  }

  private buildLowScale(ratio: number, baseMultiplier: number, length: number): ScaleItem[] {
    let baseSize = 1;
    let result = 1;
    const items: ScaleItem[] = [];

    for (let i = 0; i < length; i++) {
      result = baseSize / ratio;
      baseSize = result;
      const em = Math.round(result * 1000) / 1000;
      const px = (baseMultiplier * 16 * result).toFixed(2);
      items.push({
        em,
        px,
        label: em + 'rem/' + px + 'px',
        size: px + 'px',
        active: false,
      });
    }

    return items;
  }

  onBaseFontSizeChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (value > 0) {
      this.baseFontSize.set(value);
    }
  }

  onScaleRatioChange(event: Event) {
    this.scaleRatio.set(Number((event.target as HTMLSelectElement).value));
  }

  addHighScale() {
    this.highScaleLength.update((v) => v + 1);
  }

  addLowScale() {
    this.lowScaleLength.update((v) => v + 1);
  }

  resetScale() {
    this.baseFontSize.set(16);
    this.scaleRatio.set(1.067);
    this.highScaleLength.set(6);
    this.lowScaleLength.set(3);
  }
}
