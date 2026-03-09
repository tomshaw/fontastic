import { Component, inject, computed, ElementRef } from '@angular/core';
import { NewsService, PresentationService } from '../../../core/services';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent {
  readonly presentation = inject(PresentationService);
  readonly news = inject(NewsService);
  private el = inject(ElementRef);

  setRandomHeadline() {
    const article = this.news.randomArticle();
    if (article?.title) {
      this.presentation.setCustomText(article.title);
    }
  }

  readonly colorPickerValue = computed(() => {
    return this.presentation.fontColor() ?? this.getInheritedColor();
  });

  readonly bgPickerValue = computed(() => {
    return this.presentation.backgroundColor() ?? this.getInheritedBgColor();
  });

  get displayText() {
    return this.presentation.displayText();
  }

  handleDisplayInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.presentation.setCustomText(value);
  }

  handleQuickTextChange(event: Event) {
    const index = +(event.target as HTMLSelectElement).value;
    this.presentation.customText.set(null);
    this.presentation.quickTextIndex.set(index);
  }

  handleFontSize(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.presentation.fontSize.set(value);
  }

  handleFontColor(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.presentation.fontColor.set(value);
  }

  handleBackgroundColor(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.presentation.backgroundColor.set(value);
  }

  handleLetterSpacing(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.presentation.letterSpacing.set(value);
  }

  handleWordSpacing(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.presentation.wordSpacing.set(value);
  }

  private getInheritedColor(): string {
    const rgb = getComputedStyle(this.el.nativeElement).color;
    const match = rgb.match(/\d+/g);
    if (match && match.length >= 3) {
      return (
        '#' +
        match
          .slice(0, 3)
          .map((n) => (+n).toString(16).padStart(2, '0'))
          .join('')
      );
    }
    return '#000000';
  }

  private getInheritedBgColor(): string {
    const rgb = getComputedStyle(this.el.nativeElement).backgroundColor;
    const match = rgb.match(/\d+/g);
    if (match && match.length >= 3) {
      return (
        '#' +
        match
          .slice(0, 3)
          .map((n) => (+n).toString(16).padStart(2, '0'))
          .join('')
      );
    }
    return '#ffffff';
  }
}
