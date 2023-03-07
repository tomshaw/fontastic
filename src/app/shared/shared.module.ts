import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent, BreadcrumbsComponent, ButtonComponent, GlyphListComponent, GlyphViewComponent, LoadingComponent, ModalComponent, PageNotFoundComponent, PaginatorComponent, PairingComponent, SpinnerComponent, SplashScreenComponent, SearchComponent, SettingsComponent, StoreComponent, TablesComponent, TypescaleComponent } from './components/';
import { WebviewDirective, GravatarDirective } from './directives/';
import { SafeHtmlPipe } from './pipes/safehtml.pipe';
import { PrettyBytesPipe } from './pipes/prettybytes.pipe';
import { InstallablePipe } from './pipes/installable.pipe';

import { GeneralComponent } from './components/settings/general/general.component';
import { DatabaseComponent } from './components/settings/database/database.component';
import { ThemeComponent } from './components/settings/theme/theme.component';
import { LogsComponent } from './components/settings/logs/logs.component';
import { NewsComponent } from './components/settings/news/news.component';
import { SystemComponent } from './components/settings/system/system.component';

import { CreateCollectionComponent } from './components/collection/create-collection/create-collection.component';
import { UpdateCollectionComponent } from './components/collection/update-collection/update-collection.component';
import { FormCollectionComponent } from './components/collection/form-collection/form-collection.component';

@NgModule({
  declarations: [
    WebviewDirective,
    GravatarDirective,
    AlertComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    GlyphListComponent,
    GlyphViewComponent,
    LoadingComponent,
    ModalComponent,
    PageNotFoundComponent,
    PaginatorComponent,
    PairingComponent,
    SearchComponent,
    SpinnerComponent,
    StoreComponent,
    TablesComponent,
    TypescaleComponent,
    SafeHtmlPipe,
    PrettyBytesPipe,
    InstallablePipe,
    ModalComponent,
    SettingsComponent,
    GeneralComponent,
    DatabaseComponent,
    ThemeComponent,
    LogsComponent,
    NewsComponent,
    SystemComponent,
    CreateCollectionComponent,
    UpdateCollectionComponent,
    FormCollectionComponent,
    SplashScreenComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    GravatarDirective,
    SafeHtmlPipe,
    PrettyBytesPipe,
    InstallablePipe,
    AlertComponent,
    BreadcrumbsComponent,
    ButtonComponent,
    GlyphListComponent,
    GlyphViewComponent,
    LoadingComponent,
    ModalComponent,
    PaginatorComponent,
    PairingComponent,
    SearchComponent,
    SettingsComponent,
    SpinnerComponent,
    StoreComponent,
    TablesComponent,
    TypescaleComponent,
    SystemComponent,
    CreateCollectionComponent,
    UpdateCollectionComponent,
    FormCollectionComponent,
    SplashScreenComponent
  ]
})
export class SharedModule { }
