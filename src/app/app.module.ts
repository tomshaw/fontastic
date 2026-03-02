import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';
import { MainModule } from './pages/main/main.module';
import { SettingsModule } from './pages/settings/settings.module';
import { WaterfallModule } from './pages/waterfall/waterfall.module';
import { AppRoutingModule } from './app-routing.module';

import { ConfigService, ElectronService, MessageService } from '@app/core/services';

import { JwtInterceptor } from './core/interceptor/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    CoreModule,
    SharedModule,
    LayoutModule,
    MainModule,
    SettingsModule,
    WaterfallModule,
    AppRoutingModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      defaultLanguage: 'en'
    }),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private electronService: ElectronService
  ) {
    if (this.electronService.isElectron) {
      this.messageService.systemBoot().subscribe((result) => {
        console.log('SYSTEM-BOOT', result);
        this.configService.setConfig(result);
      });
    }
  }
}
