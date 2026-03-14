import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PresentationService } from '../../core/services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private router = inject(Router);
  readonly presentation = inject(PresentationService);

  currentUser: { name: string } | null = null;
  gravatarUrl = '';

  handleCreateCollection(event: Event) {
    event.stopPropagation();
    this.presentation.requestCreateRootCollection();
  }

  handleToggleSearch(_event: Event) {
    this.presentation.toggleSearch();
  }

  handleSwitchTheme(_event: Event) {
    this.presentation.toggleTheme();
  }
  handleLoadSettings() {
    void this.router.navigate(['/settings']);
  }
}
