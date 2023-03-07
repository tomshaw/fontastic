import { AuthUser } from "./AuthUser";

export interface DatabaseConnectionsType {
  name: string,
  type: string,
  title: string,
  description: string,
  enabled: boolean,
  synchronize: boolean,
  database: string,
  charset: string,
  logger: string,
  logging: boolean
}

export interface DatabaseLoggersType {
  title: string,
  value: string
}

export interface DatabaseType {
  drivers: string[],
  connections: DatabaseConnectionsType[],
  loggers: DatabaseLoggersType[]
}

export interface LayoutPanelType {
  _gridEnabled: boolean,
  _asideEnabled: boolean,
  _asideComponent: string,
  _asideTableTabs: any[],
  _navigationEnabled: boolean,
  _toolbarEnabled: boolean,
  _previewEnabled: boolean,
  _inspectEnabled: boolean,
  _inspectComponent: string,
  _statsCollapsed: boolean,
  _foldersCollapsed: boolean,
  _optionsCollapsed: boolean
}

export interface LayoutThemeType {
  _defaultTheme: string
}

export interface LayoutPreviewType {
  _fontSize: number,
  _fontColor: string,
  _displayText: string,
  _backgroundColor: string,
  _wordSpacing: number,
  _letterSpacing: number,
  _displayNews?: boolean
}

export interface LayoutType {
  panel: LayoutPanelType,
  theme: LayoutThemeType,
  preview: LayoutPreviewType
}

export interface NewsArticlesType {
  source?: {
    id: string,
    name: string
  },
  author?: string,
  title?: string,
  description?: string,
  url?: string,
  urlToImage?: string,
  publishedAt?: string,
  content?: string
}

export interface NewsType {
  ts?: number,
  articles?: NewsArticlesType[],
  apiKey?: string,
  status?: string
}

export interface OptionsType {
  import?: {
    type: string
  }
}

export interface CatalogType {
  collection?: {
    id: number
  },
  store?: {
    id: number
  }
}

export interface UptimeType {
  ts: number,
  hours: number,
  minutes: number,
  seconds: number
}

export interface SystemType {
  uptime: UptimeType,
  locale: string,
  is_dev: boolean,
  is_production: boolean,
  is_x86: boolean,
  is_x64: boolean,
  is_mac: boolean,
  is_windows: boolean,
  is_linux: boolean,
  cache_path: string,
  app_path: string,
  app_data_path: string,
  user_data_path: string,
  downloads_path: string,
  session_path: string,
  catalog_path: string
}

export interface SystemConfig {
  catalog?: CatalogType;
  database: DatabaseType;
  layout?: LayoutType;
  news?: NewsType;
  options: OptionsType;
  system: SystemType;
  user?: AuthUser;
}
