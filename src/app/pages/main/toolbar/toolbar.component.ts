import { Component, OnInit } from '@angular/core';
import { NewsService, PresentationService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  fontColor: string = "#ac1fad";
  fontSize: number = 48;
  displayText!: string;
  latestNews: any = [];
  quickTextIndex: number = 0;
  backgroundColor: string = "#ffffff";

  // text_format
  buttonType: number = 0;
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
    private newsService: NewsService,
    private presentationService: PresentationService,
  ) { }

  ngOnInit() {

    this.presentationService.watchFontColor$.subscribe((value) => {
      this.fontColor = value;
    });

    this.presentationService.watchFontSize$.subscribe((value) => {
      this.fontSize = value;
    });

    this.presentationService.watchBackgroundColor$.subscribe((value) => {
      this.backgroundColor = value;
    });

    this.presentationService.watchDisplayText$.subscribe((value) => {
      this.displayText = value;
    });

    this.newsService.watchLatestNews$.subscribe((values) => {
      if (values.length) {
        this.latestNews = values;
      }
    });
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
    if (event.keyCode == 13) {
      this.toggleTextClass(target.parentNode);
      el.blur();
    }
    this.presentationService.setDisplayText(value);
    this.presentationService.savePreviewSettings();
  }

  handleDisplayButton(event: any): void {
    const target = event.target;
    this.toggleTextClass(target.parentNode.parentNode);
  }

  handleQuickText(event: any): void {
    const text = this.presentationService.getQuickText();
    this.quickTextIndex++;
    if (this.quickTextIndex >= text.length) {
      this.quickTextIndex = 0;
    }
    this.presentationService.setDisplayText(text[this.quickTextIndex]['quote']);
    this.presentationService.savePreviewSettings();
    this.presentationService.setDisplayNews(false);
  }

  handleLatestNews(event: any): void {
    let toggle = this.presentationService.getDisplayNews();
    this.presentationService.setDisplayNews(!toggle);
  }

  toggleTextClass(el: any) {
    if (el.classList.contains('open')) {
      el.classList.remove('open');
    } else {
      el.classList.add('open');
    }
  }

  handleSpacingButton(event: any): void {
    const target = event.target;
    const parent = target.parentNode; // .innerHTML;
    const buttonType = parent.dataset.type;

    if (buttonType >= this.buttonTypes.length -1) {
      this.buttonType = 0;
    } else {
      this.buttonType++;
    }

    target.innerHTML = this.buttonTypes[this.buttonType].icon;
    parent.dataset.type = this.buttonType;
    parent.title = this.buttonTypes[this.buttonType].title;
  }

  handleResetButton(event: any): void {
    this.presentationService.resetPreview();
  }

}
