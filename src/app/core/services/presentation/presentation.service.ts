import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { MessageService } from '../message/message.service';
import { ElectronService } from '@app/core/services/electron/electron.service';

import { AppThemes } from '@main/config/themes';
import { SystemTheme } from '@app/core/interface';

export class ScrollToOptions {
  id!: string;
  type!: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresentationService {

  quickText: any[] = [{
    author: "Letters",
    quote: "The quick brown fox jumped over the lazy dog."
  }, {
    author: "Alphabet",
    quote: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  }, {
    author: "Alphabet",
    quote: "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"
  }];

  // Defaults.
  defaultText: string = "The quick brown fox jumped over the lazy dog.";
  defaultFontSize: number = 48;
  defaultFontColor: string = "#3e4245";
  defaultBackgroundColor: string = "#ffffff";

  defaultWordSpacing: number = 0;
  defaultLetterSpacing: number = 0;

  _gridEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _toolbarEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _previewEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _inspectEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _navigationEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _asideEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _statsCollapsed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _waterfallEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  _systemLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _loadingScreen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _loadingSpinner: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _loadingMessage: BehaviorSubject<string> = new BehaviorSubject('');

  _scrollToItem: BehaviorSubject<ScrollToOptions | null> = new BehaviorSubject<ScrollToOptions | null>(null);

  private _fontSize = new BehaviorSubject<number>(this.defaultFontSize);
  watchFontSize$ = this._fontSize.asObservable();

  private _fontColor = new BehaviorSubject<string>(this.defaultFontColor);
  watchFontColor$ = this._fontColor.asObservable();

  private _displayText = new BehaviorSubject<string>(this.defaultText);
  watchDisplayText$ = this._displayText.asObservable();

  private _backgroundColor = new BehaviorSubject<string>(this.defaultBackgroundColor);
  watchBackgroundColor$ = this._backgroundColor.asObservable();

  private _wordSpacing = new BehaviorSubject<number>(this.defaultWordSpacing);
  watchWordSpacing$ = this._wordSpacing.asObservable();

  private _letterSpacing = new BehaviorSubject<number>(this.defaultLetterSpacing);
  watchLetterSpacing$ = this._letterSpacing.asObservable();

  _defaultTheme: BehaviorSubject<string> = new BehaviorSubject('default');

  _gridRowsExpanded: BehaviorSubject<boolean> = new BehaviorSubject(true);

  _displayNews: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private electronService: ElectronService
  ) {

    if (this.electronService.isElectron) {

      if (this.configService.has('PANEL_SETTINGS')) {
        this.loadLayoutSettings();
      }

      if (this.configService.has('PREVIEW_SETTINGS')) {
        this.loadPreviewSettings();
      }

      if (this.configService.has('THEME_SETTINGS')) {
        this.loadThemeSettings();
      }

    }
  }

  getQuickText(): any {
    return this.quickText;
  }

  setNavigationEnabled(status: any): void {
    this._navigationEnabled.next(status);
    this.saveLayoutSettings();
  }

  setAsideEnabled(status: any): void {
    this._asideEnabled.next(status);
    this.saveLayoutSettings();
  }

  setGridEnabled(status: any): void {
    this._gridEnabled.next(status);
    this.saveLayoutSettings();
  }

  setToolbarEnabled(status: any): void {
    this._toolbarEnabled.next(status);
    this.saveLayoutSettings();
  }

  setPreviewEnabled(status: any): void {
    this._previewEnabled.next(status);
    this.saveLayoutSettings();
  }

  setInspectEnabled(status: any): void {
    this._inspectEnabled.next(status);
    this.saveLayoutSettings();
  }

  setStatsCollapsed(toggle: any): void {
    this._statsCollapsed.next(toggle);
    this.saveLayoutSettings();
  }

  setWaterfallEnabled(status: boolean): void {
    this._waterfallEnabled.next(status);
  }

  saveLayoutSettings(): void {
    const settings = {
      _gridEnabled: this._gridEnabled.getValue(),
      _asideEnabled: this._asideEnabled.getValue(),
      _navigationEnabled: this._navigationEnabled.getValue(),
      _toolbarEnabled: this._toolbarEnabled.getValue(),
      _previewEnabled: this._previewEnabled.getValue(),
      _inspectEnabled: this._inspectEnabled.getValue(),
      _statsCollapsed: this._statsCollapsed.getValue()
    }
    this.messageService.set('PANEL_SETTINGS', settings);
  }

  loadLayoutSettings(): void {
    const settings = this.configService.get('PANEL_SETTINGS');
    if (Object.keys(settings).length) {
      const map: Record<string, BehaviorSubject<any>> = {
        _gridEnabled: this._gridEnabled,
        _asideEnabled: this._asideEnabled,
        _navigationEnabled: this._navigationEnabled,
        _toolbarEnabled: this._toolbarEnabled,
        _previewEnabled: this._previewEnabled,
        _inspectEnabled: this._inspectEnabled,
        _statsCollapsed: this._statsCollapsed
      };
      for (const [key, value] of Object.entries(settings)) {
        if (map[key]) { map[key].next(value); }
      }
    }
  }

  savePreviewSettings(): void {
    const settings = {
      _fontSize: this._fontSize.getValue(),
      _fontColor: this._fontColor.getValue(),
      _displayText: this._displayText.getValue(),
      _backgroundColor: this._backgroundColor.getValue(),
      _wordSpacing: this._wordSpacing.getValue(),
      _letterSpacing: this._letterSpacing.getValue()
    }
    this.messageService.set('PREVIEW_SETTINGS', settings);
  }

  loadPreviewSettings(): void {
    const settings = this.configService.get('PREVIEW_SETTINGS');
    if (Object.keys(settings).length) {
      const map: Record<string, BehaviorSubject<any>> = {
        _fontSize: this._fontSize,
        _fontColor: this._fontColor,
        _displayText: this._displayText,
        _backgroundColor: this._backgroundColor,
        _wordSpacing: this._wordSpacing,
        _letterSpacing: this._letterSpacing
      };
      for (const [key, value] of Object.entries(settings)) {
        if (map[key]) { map[key].next(value); }
      }
    }
  }

  saveThemeSettings(): void {
    const settings = {
      _defaultTheme: this._defaultTheme.getValue()
    }
    this.messageService.set('THEME_SETTINGS', settings);
  }

  loadThemeSettings(): void {
    const settings = this.configService.get('THEME_SETTINGS');
    if (Object.keys(settings).length) {
      const map: Record<string, BehaviorSubject<any>> = {
        _defaultTheme: this._defaultTheme
      };
      for (const [key, value] of Object.entries(settings)) {
        if (map[key]) { map[key].next(value); }
      }
    }
  }

  setSystemLoading(value: boolean): void {
    this._systemLoading.next(value)
  }

  setLoadingScreen(value: boolean): void {
    this._loadingScreen.next(value)
  }

  setLoadingSpinner(value: boolean): void {
    this._loadingSpinner.next(value)
  }

  setLoadingMessage(value: string): void {
    this._loadingMessage.next(value);
  }

  setFontSize(value: number): void {
    this._fontSize.next(value);
    this.savePreviewSettings();
  }

  setFontColor(value: string): void {
    this._fontColor.next(value);
    this.savePreviewSettings();
  }

  setDisplayText(value: string): void {
    this._displayText.next(value);
    this.savePreviewSettings();
  }

  setBackgroundColor(value: string): void {
    this._backgroundColor.next(value);
    this.savePreviewSettings();
  }

  setWordSpacing(value: number): void {
    this._wordSpacing.next(value);
    this.savePreviewSettings();
  }

  setLetterSpacing(value: number): void {
    this._letterSpacing.next(value);
    this.savePreviewSettings();
  }

  setTheme(value: string): void {
    this._defaultTheme.next(value);
    this.saveThemeSettings();
  }

  getTheme(): string {
    return this._defaultTheme.getValue();
  }

  getThemes(): SystemTheme[] {
    return AppThemes;
  }

  resetPreview() {
    const settings = {
      _fontSize: this.defaultFontSize,
      _fontColor: this.defaultFontColor,
      _displayText: this._displayText.getValue(),
      _backgroundColor: this.defaultBackgroundColor,
      _wordSpacing: this.defaultWordSpacing,
      _letterSpacing: this.defaultLetterSpacing
    }

    const map: Record<string, BehaviorSubject<any>> = {
      _fontSize: this._fontSize,
      _fontColor: this._fontColor,
      _displayText: this._displayText,
      _backgroundColor: this._backgroundColor,
      _wordSpacing: this._wordSpacing,
      _letterSpacing: this._letterSpacing
    };
    for (const [key, value] of Object.entries(settings)) {
      if (map[key]) { map[key].next(value); }
    }

    this.messageService.set('PREVIEW_SETTINGS', settings);
  }

  setThemeDefaults(theme: string): void {
    if (theme == 'midnight') {
      this.setFontColor('#ffffff');
      this.setBackgroundColor('#000000');
    } else if (theme == 'euphoria') {
      this.setFontColor('#f4b903');
      this.setBackgroundColor('#23121c');
    } else if (theme == 'dashboard') {
      this.setFontColor('#ffffff');
      this.setBackgroundColor('#14202a');
    } else if (theme == 'modern') {
      this.setFontColor('#ffffff');
      this.setBackgroundColor('#ea7196');
    } else if (theme == 'swiss') {
      this.setFontColor('#ffffff');
      this.setBackgroundColor('#ed1b24');
    } else if (theme == 'passion') {
      this.setFontColor('#ffffff');
      this.setBackgroundColor('#620f72');
    } else {
      this.setFontColor('#3e4245');
      this.setBackgroundColor('#ffffff');
    }
  }

  /**
   * Toggle grid rows expanded.
   */

  getGridRowsExpanded() {
    return this._gridRowsExpanded.getValue();
  }

  setGridRowsExpanded(toggle: boolean) {
    this._gridRowsExpanded.next(toggle);
  }

  /**
   * Toggle display news articles.
   */

  getDisplayNews() {
    return this._displayNews.getValue();
  }

  setDisplayNews(toggle: boolean) {
    this._displayNews.next(toggle);
  }

}
