import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, TranslatePipe, FormsModule],
  exports: [TranslatePipe, FormsModule],
})
export class SharedModule {}
