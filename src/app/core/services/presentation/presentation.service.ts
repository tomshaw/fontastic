import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { MessageService } from '../message/message.service';
import { ElectronService } from '@app/core/services/electron/electron.service';
import { AppThemes, ThemeColors } from '@main/config/themes';
import { SystemTheme } from '@app/core/interface';

export class ScrollToOptions {
  id: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresentationService {

  quickText: any[] = [{
    title: 'default',
    text: 'The quick brown fox jumped over the lazy dog.'
  }, {
    title: 'All Caps',
    text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }, {
    title: 'Alternating Caps',
    text: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'
  }];

  // Defaults.
  defaultText = 'The quick brown fox jumped over the lazy dog.';
  defaultFontSize = 48;
  defaultFontColor = '#3e4245';
  defaultBackgroundColor = '#ffffff';

  defaultWordSpacing = 0;
  defaultLetterSpacing = 0;

  _gridEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _toolbarEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _previewEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _inspectEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _navigationEnabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _asideEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _statsCollapsed: BehaviorSubject<boolean> = new BehaviorSubject(false);

  _systemLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  _loadingScreen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _loadingSpinner: BehaviorSubject<boolean> = new BehaviorSubject(false);

  _scrollToItem: BehaviorSubject<ScrollToOptions> = new BehaviorSubject(null);

  _fontSize = new BehaviorSubject<number>(this.defaultFontSize);
  watchFontSize$ = this._fontSize.asObservable();

  _fontColor = new BehaviorSubject<string>(this.defaultFontColor);
  watchFontColor$ = this._fontColor.asObservable();

  _displayText = new BehaviorSubject<string>(this.defaultText);
  watchDisplayText$ = this._displayText.asObservable();

  _backgroundColor = new BehaviorSubject<string>(this.defaultBackgroundColor);
  watchBackgroundColor$ = this._backgroundColor.asObservable();

  _wordSpacing = new BehaviorSubject<number>(this.defaultWordSpacing);
  watchWordSpacing$ = this._wordSpacing.asObservable();

  _letterSpacing = new BehaviorSubject<number>(this.defaultLetterSpacing);
  watchLetterSpacing$ = this._letterSpacing.asObservable();

  _defaultTheme: BehaviorSubject<string> = new BehaviorSubject('default');

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

  saveLayoutSettings(): void {
    const settings = {
      _gridEnabled: this._gridEnabled.getValue(),
      _asideEnabled: this._asideEnabled.getValue(),
      _navigationEnabled: this._navigationEnabled.getValue(),
      _toolbarEnabled: this._toolbarEnabled.getValue(),
      _previewEnabled: this._previewEnabled.getValue(),
      _inspectEnabled: this._inspectEnabled.getValue(),
      _statsCollapsed: this._statsCollapsed.getValue()
    };
    this.messageService.set('PANEL_SETTINGS', settings);
  }

  loadLayoutSettings(): void {
    const settings = this.configService.get('PANEL_SETTINGS');
    if (Object.keys(settings).length) {
      for (const [key, value] of Object.entries(settings)) {
        if (this[key]) {
          this[key].next(value);
        }
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
      _letterSpacing: this._letterSpacing.getValue(),
      _displayNews: this._displayNews.getValue()
    };
    this.messageService.set('PREVIEW_SETTINGS', settings);
  }

  loadPreviewSettings(): void {
    const settings: any = this.configService.get('PREVIEW_SETTINGS');
    if (Object.keys(settings).length) {
      for (const [key, value] of Object.entries(settings)) {
        if (this[key]) {
          this[key].next(value);
        }
      }
    }
  }

  saveThemeSettings(): void {
    const settings = {
      _defaultTheme: this._defaultTheme.getValue()
    };
    this.messageService.set('THEME_SETTINGS', settings);
  }

  loadThemeSettings(): void {
    const settings: any = this.configService.get('THEME_SETTINGS');
    if (Object.keys(settings).length) {
      for (const [key, value] of Object.entries(settings)) {
        if (this[key]) {
          this[key].next(value);
        }
      }
    }
  }

  setSystemLoading(value: boolean): void {
    this._systemLoading.next(value);
  }

  setLoadingScreen(value: boolean): void {
    this._loadingScreen.next(value);
  }

  setLoadingSpinner(value: boolean): void {
    this._loadingSpinner.next(value);
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
    };
    for (const [key, value] of Object.entries(settings)) {
      if (this[key]) {
        this[key].next(value);
      }
    }
    this.messageService.set('PREVIEW_SETTINGS', settings);
  }

  setThemeDefaults(theme: string): void {
    if (ThemeColors.has(theme)) {
      this.setFontColor(ThemeColors.get(theme).color);
      this.setBackgroundColor(ThemeColors.get(theme).background);      
    } else {
      this.setFontColor(ThemeColors.get('default').color);
      this.setBackgroundColor(ThemeColors.get('default').background); 
    }
  }

  getDisplayNews(): boolean {
    return this._displayNews.getValue();
  }

  setDisplayNews(toggle: boolean): void {
    this._displayNews.next(toggle);
  }
}
