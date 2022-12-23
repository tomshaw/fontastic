import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

//import { NgChartsModule } from 'ng2-charts';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';
import { MainModule } from './pages/main/main.module';
import { SettingsModule } from './pages/settings/settings.module';
import { AppRoutingModule } from './app-routing.module';

import { ConfigService, ElectronService, MessageService } from '@app/core/services';

// AoT requires an exported function for factories
export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    //NgChartsModule,
    SharedModule,
    LayoutModule,
    MainModule,
    SettingsModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private electronService: ElectronService,
  ) {
    if (this.electronService.isElectron) {
      this.messageService.systemBoot().then((result) => {
        console.log('SYSTEM-BOOT-CONFIG', result);
        this.configService.setConfig(result);
      });
    }
  }
}
