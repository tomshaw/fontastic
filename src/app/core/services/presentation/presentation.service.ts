import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import { MessageService } from '../message/message.service';
import { ChannelType, StorageType } from '@main/enums';
import type { LayoutPanelType, LayoutPreviewType, NativeThemeState, ScanProgress } from '@main/types';

@Injectable({ providedIn: 'root' })
export class PresentationService {
  private electronService = inject(ElectronService);
  private messageService = inject(MessageService);

  readonly loading = signal(false);
  private loadingCount = 0;

  startLoading() {
    this.loadingCount++;
    this.loading.set(true);
  }

  stopLoading() {
    this.loadingCount--;
    if (this.loadingCount === 0) {
      this.loading.set(false);
      this.scanProgress.set(null);
    }
  }

  static readonly themes = ['light', 'dark', 'dashboard', 'euphoria', 'midnight', 'mellow', 'passion', 'swiss'] as const;

  readonly theme = signal<string>('light');

  // Native Theme: auto-sync with OS dark mode
  readonly autoTheme = signal(false);
  readonly nativeThemeState = signal<NativeThemeState | null>(null);

  // System Preferences
  readonly systemAccentColor = signal('');
  readonly reduceMotion = signal(false);

  // Power Monitor
  readonly suspended = signal(false);

  // Scan Progress (MessageChannelMain)
  readonly scanProgress = signal<ScanProgress | null>(null);

  constructor() {
    effect(() => {
      const current = this.theme();
      const el = document.documentElement;
      for (const t of PresentationService.themes) {
        el.classList.toggle(t, t === current);
      }
    });

    // Apply reduce-motion class based on OS preference
    effect(() => {
      document.documentElement.classList.toggle('reduce-motion', this.reduceMotion());
    });

    if (this.electronService.isElectron) {
      this.loadThemeSettings();
      this.loadLayoutSettings();
      this.loadPreviewSettings();
      this.loadNavigationExpandedSettings();
      this.listenForMenuToggle();
      this.initNativeTheme();
      this.initSystemPreferences();
      this.initPowerMonitor();
      this.initScanProgress();

      let themeInitialized = false;
      effect(() => {
        const current = this.theme();
        if (themeInitialized) {
          untracked(() => this.messageService.set(StorageType.LayoutTheme, { theme: current }));
        }
        themeInitialized = true;
      });

      let panelInitialized = false;
      effect(() => {
        const settings: LayoutPanelType = {
          gridEnabled: this.gridEnabled(),
          asideEnabled: this.asideEnabled(),
          navigationEnabled: this.navigationEnabled(),
          toolbarEnabled: this.toolbarEnabled(),
          previewEnabled: this.previewEnabled(),
          glyphsEnabled: this.glyphsEnabled(),
          searchEnabled: this.searchEnabled(),
          waterfallEnabled: this.waterfallEnabled(),
        };
        if (panelInitialized) {
          untracked(() => this.messageService.set(StorageType.LayoutPanel, settings));
        }
        panelInitialized = true;
      });

      let navExpandedInitialized = false;
      effect(() => {
        const ids = this.navigationExpandedIds();
        if (navExpandedInitialized) {
          untracked(() => this.messageService.set(StorageType.NavigationExpanded, ids));
        }
        navExpandedInitialized = true;
      });

      let previewInitialized = false;
      effect(() => {
        const settings: LayoutPreviewType = {
          fontSize: this.fontSize(),
          fontColor: this.fontColor(),
          backgroundColor: this.backgroundColor(),
          displayText: this.customText(),
          wordSpacing: this.wordSpacing(),
          letterSpacing: this.letterSpacing(),
          selectedGlyph: this.selectedGlyph(),
        };
        if (previewInitialized) {
          untracked(() => this.messageService.set(StorageType.LayoutPreview, settings));
        }
        previewInitialized = true;
      });
    }
  }

  toggleTheme() {
    const themes = PresentationService.themes;
    const i = themes.indexOf(this.theme() as (typeof themes)[number]);
    this.theme.set(themes[(i + 1) % themes.length]);
  }

  readonly quickTexts = [
    { title: 'Default', text: 'The quick brown fox jumped over the lazy dog.' },
    { title: 'All Caps', text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { title: 'Alternating Caps', text: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz' },
  ];

  readonly quickTextIndex = signal(0);
  readonly customText = signal<string | null>(null);
  readonly quickText = computed(() => this.quickTexts[this.quickTextIndex()]);
  readonly displayText = computed(() => this.customText() ?? this.quickText().text);

  cycleQuickText() {
    this.customText.set(null);
    this.quickTextIndex.update((i) => (i + 1) % this.quickTexts.length);
  }

  setCustomText(text: string) {
    this.customText.set(text);
  }

  readonly fontSize = signal(24);
  readonly fontColor = signal<string | null>(null);
  readonly backgroundColor = signal<string | null>(null);
  readonly letterSpacing = signal(0);
  readonly wordSpacing = signal(0);

  readonly selectedGlyph = signal<number | null>(null);

  readonly createRootCollectionRequest = signal(0);

  requestCreateRootCollection() {
    this.navigationEnabled.set(true);
    this.createRootCollectionRequest.update((v) => v + 1);
  }

  readonly navigationExpandedIds = signal<number[]>([]);

  readonly gridEnabled = signal(true);
  readonly toolbarEnabled = signal(true);
  readonly previewEnabled = signal(true);
  readonly glyphsEnabled = signal(false);
  readonly asideEnabled = signal(true);
  readonly navigationEnabled = signal(true);
  readonly searchEnabled = signal(false);
  readonly waterfallEnabled = signal(false);

  readonly activePanelCount = computed(
    () =>
      [
        this.gridEnabled(),
        this.toolbarEnabled(),
        this.previewEnabled(),
        this.glyphsEnabled(),
        this.asideEnabled(),
        this.navigationEnabled(),
      ].filter(Boolean).length,
  );

  toggleGrid() {
    this.gridEnabled.update((v) => !v);
  }
  toggleToolbar() {
    this.toolbarEnabled.update((v) => !v);
  }
  togglePreview() {
    this.previewEnabled.update((v) => !v);
  }
  toggleGlyphs() {
    this.glyphsEnabled.update((v) => !v);
  }
  toggleAside() {
    this.asideEnabled.update((v) => !v);
  }
  toggleNavigation() {
    this.navigationEnabled.update((v) => !v);
  }
  toggleSearch() {
    const enabling = !this.searchEnabled();
    this.searchEnabled.set(enabling);
    if (enabling) {
      this.waterfallEnabled.set(false);
      this.glyphsEnabled.set(false);
      this.previewEnabled.set(false);
    }
  }
  toggleWaterfall() {
    this.waterfallEnabled.update((v) => !v);
  }

  private readonly panelToggleMap: Record<string, () => void> = {
    navigation: () => this.toggleNavigation(),
    aside: () => this.toggleAside(),
    preview: () => this.togglePreview(),
    glyphs: () => this.toggleGlyphs(),
    toolbar: () => this.toggleToolbar(),
    grid: () => this.toggleGrid(),
    waterfall: () => this.toggleWaterfall(),
  };

  private listenForMenuToggle() {
    this.messageService.on(ChannelType.IPC_TOGGLE_PANEL, (_event: any, panel: string) => {
      const toggle = this.panelToggleMap[panel];
      if (toggle) {
        toggle();
      }
    });
  }

  isNavigationExpanded(id: number): boolean {
    return this.navigationExpandedIds().includes(id);
  }

  toggleNavigationExpanded(id: number) {
    const ids = this.navigationExpandedIds();
    if (ids.includes(id)) {
      this.navigationExpandedIds.set(ids.filter((i) => i !== id));
    } else {
      this.navigationExpandedIds.set([...ids, id]);
    }
  }

  expandNavigationId(id: number) {
    const ids = this.navigationExpandedIds();
    if (!ids.includes(id)) {
      this.navigationExpandedIds.set([...ids, id]);
    }
  }

  setAllNavigationExpanded(allIds: number[]) {
    this.navigationExpandedIds.set(allIds);
  }

  clearAllNavigationExpanded() {
    this.navigationExpandedIds.set([]);
  }

  // --- Native Theme ---

  private async initNativeTheme() {
    const state = await this.messageService.getNativeTheme();
    this.nativeThemeState.set(state);
    this.applyAutoTheme(state);

    this.messageService.on(ChannelType.IPC_NATIVE_THEME_CHANGED, (_event: any, state: NativeThemeState) => {
      this.nativeThemeState.set(state);
      this.applyAutoTheme(state);
    });
  }

  private applyAutoTheme(state: NativeThemeState) {
    if (this.autoTheme()) {
      this.theme.set(state.shouldUseDarkColors ? 'midnight' : 'light');
    }
  }

  setAutoTheme(enabled: boolean) {
    this.autoTheme.set(enabled);
    if (enabled) {
      const state = this.nativeThemeState();
      if (state) {
        this.theme.set(state.shouldUseDarkColors ? 'midnight' : 'light');
      }
    }
  }

  // --- System Preferences ---

  private async initSystemPreferences() {
    const prefs = await this.messageService.getSystemPreferences();
    this.systemAccentColor.set(prefs.accentColor);
    this.reduceMotion.set(prefs.reduceMotion);
  }

  // --- Power Monitor ---

  private initPowerMonitor() {
    this.messageService.on(ChannelType.IPC_POWER_SUSPEND, () => {
      this.suspended.set(true);
    });

    this.messageService.on(ChannelType.IPC_POWER_RESUME, () => {
      this.suspended.set(false);
    });
  }

  // --- Scan Progress (MessageChannelMain) ---

  private initScanProgress() {
    this.electronService.ipcRenderer.on(ChannelType.IPC_SCAN_PROGRESS_PORT, (event: any) => {
      const port = event.ports[0];
      if (!port) return;

      port.onmessage = (msgEvent: MessageEvent<ScanProgress>) => {
        this.scanProgress.set(msgEvent.data);
      };

      port.onclose = () => {
        this.scanProgress.set(null);
      };

      port.start();
    });
  }

  private async loadNavigationExpandedSettings() {
    const ids = (await this.messageService.get(StorageType.NavigationExpanded, null)) as number[] | null;
    if (Array.isArray(ids)) {
      this.navigationExpandedIds.set(ids);
    }
  }

  private async loadThemeSettings() {
    const settings = (await this.messageService.get(StorageType.LayoutTheme, null)) as { theme: string } | null;
    if (settings?.theme && PresentationService.themes.includes(settings.theme as (typeof PresentationService.themes)[number])) {
      this.theme.set(settings.theme);
    }
  }

  private async loadLayoutSettings() {
    const settings = (await this.messageService.get(StorageType.LayoutPanel, null)) as LayoutPanelType | null;
    if (settings) {
      this.gridEnabled.set(settings.gridEnabled);
      this.asideEnabled.set(settings.asideEnabled);
      this.navigationEnabled.set(settings.navigationEnabled);
      this.toolbarEnabled.set(settings.toolbarEnabled);
      this.previewEnabled.set(settings.previewEnabled);
      this.glyphsEnabled.set(settings.glyphsEnabled);
      if (settings.searchEnabled !== undefined) {
        this.searchEnabled.set(settings.searchEnabled);
      }
      if (settings.waterfallEnabled !== undefined) {
        this.waterfallEnabled.set(settings.waterfallEnabled);
      }
    }
  }

  private async loadPreviewSettings() {
    const settings = (await this.messageService.get(StorageType.LayoutPreview, null)) as LayoutPreviewType | null;
    if (settings) {
      this.fontSize.set(settings.fontSize);
      this.fontColor.set(settings.fontColor);
      this.backgroundColor.set(settings.backgroundColor ?? null);
      this.wordSpacing.set(settings.wordSpacing);
      this.letterSpacing.set(settings.letterSpacing);
      if (settings.displayText) {
        this.customText.set(settings.displayText);
      }
      if (settings.selectedGlyph !== undefined) {
        this.selectedGlyph.set(settings.selectedGlyph);
      }
    }
  }

  resetDefaults() {
    this.gridEnabled.set(true);
    this.toolbarEnabled.set(true);
    this.previewEnabled.set(true);
    this.glyphsEnabled.set(false);
    this.asideEnabled.set(true);
    this.navigationEnabled.set(true);
    this.searchEnabled.set(false);
    this.waterfallEnabled.set(false);
  }

  resetToolbarDefaults() {
    this.fontSize.set(24);
    this.fontColor.set(null);
    this.backgroundColor.set(null);
    this.letterSpacing.set(0);
    this.wordSpacing.set(0);
    this.customText.set(null);
    this.quickTextIndex.set(0);
  }
}
