import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { APP_CONFIG } from './environments/environment';
import { CoreModule } from './app/core/core.module';
import { SharedModule } from './app/shared/shared.module';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { PageNotFoundComponent } from './app/shared/components';
import { LayoutComponent } from './app/layout/layout.component';
import { MainComponent } from './app/layout/main/main.component';
import { SettingsComponent } from './app/settings/settings.component';
import { SettingsGeneralPageComponent } from './app/settings/pages/general/general.component';
import { SettingsLogsPageComponent } from './app/settings/pages/logs/logs.component';
import { SettingsSystemPageComponent } from './app/settings/pages/system/system.component';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
    provideRouter([
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: LayoutComponent,
        children: [{ path: '', component: MainComponent }],
      },
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          { path: 'general', component: SettingsGeneralPageComponent },
          { path: 'logs', component: SettingsLogsPageComponent },
          { path: 'system', component: SettingsSystemPageComponent },
        ],
      },
      {
        path: '**',
        component: PageNotFoundComponent,
      },
    ]),
    importProvidersFrom(CoreModule, SharedModule),
  ],
}).catch((err) => console.error(err));
