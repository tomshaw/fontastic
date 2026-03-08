import { Component, inject } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AsideComponent } from './aside/aside.component';
import { FooterComponent } from './footer/footer.component';
import { DatabaseService, PresentationService } from '../core/services';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavigationComponent, AsideComponent, FooterComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly db = inject(DatabaseService);
  readonly presentation = inject(PresentationService);
}
