import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
/* eslint-disable-next-line max-len */
import { PageNotFoundComponent, AlertComponent, ButtonComponent, LoadingComponent, SpinnerComponent, BreadcrumbsComponent, PaginatorComponent } from './components/';
import { WebviewDirective, GravatarDirective } from './directives/';
import { SafeHtmlPipe } from './pipes/safehtml.pipe';
import { PrettyBytesPipe } from './pipes/prettybytes.pipe';
import { InstallablePipe } from './pipes/installable.pipe';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    GravatarDirective,
    AlertComponent,
    ButtonComponent,
    BreadcrumbsComponent,
    LoadingComponent,
    PaginatorComponent,
    SpinnerComponent,
    SafeHtmlPipe,
    PrettyBytesPipe,
    InstallablePipe
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
    ButtonComponent,
    BreadcrumbsComponent,
    LoadingComponent,
    PaginatorComponent,
    SpinnerComponent
  ]
})
export class SharedModule { }
