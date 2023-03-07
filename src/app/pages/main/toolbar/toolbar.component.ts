import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  fontColor = '#ac1fad';
  fontSize = 72;
  displayText: string;

  quickTextIndex = 0;
  backgroundColor = '#ffffff';

  // text_format
  buttonType = 0;
  buttonTypes: any[] = [{
    type: 0,
    icon: 'format_size',
    title: 'Font Size',
  }, {
    type: 1,
    icon: 'format_textdirection_l_to_r',
    title: 'Word Spacing',
  }, {
    type: 2,
    icon: 'format_textdirection_r_to_l',
    title: 'Letter Spacing',
  }];

  constructor(
    private presentationService: PresentationService,
  ) { }

  ngOnInit() {

    this.presentationService.watchFontColor$.subscribe((value) => this.fontColor = value);

    this.presentationService.watchFontSize$.subscribe((value) => this.fontSize = value);

    this.presentationService.watchBackgroundColor$.subscribe((value) => this.backgroundColor = value);

    this.presentationService.watchDisplayText$.subscribe((value) => this.displayText = value);
  }

  onFontColor(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.presentationService.setFontColor(target.value);
    this.presentationService.savePreviewSettings();
  }

  onBackgroundColor(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.presentationService.setBackgroundColor(target.value);
    this.presentationService.savePreviewSettings();
  }

  onFontSize(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.presentationService.setFontSize(Number(target.value));
    this.presentationService.savePreviewSettings();
  }

  onWordSpacing(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.presentationService.setWordSpacing(Number(target.value));
    this.presentationService.savePreviewSettings();
  }

  onLetterSpacing(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.presentationService.setLetterSpacing(Number(target.value));
    this.presentationService.savePreviewSettings();
  }

  handleDisplayInput(event: any): void {
    const el = event.srcElement;
    const target = event.target;
    const value = target.value;
    if (event.keyCode === 13) {
      this.toggleTextClass(target.parentNode);
      el.blur();
    }
    this.presentationService.setDisplayText(value);
    this.presentationService.savePreviewSettings();
  }

  handleDisplayButton(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggleTextClass(target.parentNode.parentNode as HTMLElement);
  }

  handleQuickText(event: Event): void {
    const text = this.presentationService.getQuickText();
    this.quickTextIndex = (this.quickTextIndex >= text.length - 1) ? 0 : this.quickTextIndex + 1;
    this.presentationService.setDisplayText(text[this.quickTextIndex].text);
    this.presentationService.setDisplayNews((text[this.quickTextIndex].title === 'Latest News') ? true : false);
    this.presentationService.savePreviewSettings();
  }

  toggleTextClass(el: HTMLElement): void {
    if (el.classList.contains('open')) {
      el.classList.remove('open');
    } else {
      el.classList.add('open');
    }
  }

  handleSpacingButton(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;
    const buttonType = Number(parent.dataset.type);
    
    if (buttonType >= this.buttonTypes.length - 1) {
      this.buttonType = 0;
    } else {
      this.buttonType++;
    }

    target.innerHTML = this.buttonTypes[this.buttonType].icon;

    parent.setAttribute('type', String(this.buttonType));
    parent.setAttribute('title', this.buttonTypes[this.buttonType].title);
  }

  handleResetButton(event: Event): void {
    this.presentationService.resetPreview();
  }
}
