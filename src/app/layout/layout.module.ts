import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared/shared.module';

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AsideComponent } from './aside/aside.component';
import { SearchComponent } from './aside/search/search.component';
import { TablesComponent } from './aside/tables/tables.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule
  ],
  declarations: [
    LayoutComponent, 
    HeaderComponent, 
    FooterComponent, 
    NavigationComponent, 
    AsideComponent, 
    SearchComponent, 
    TablesComponent
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
