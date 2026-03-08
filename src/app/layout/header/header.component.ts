import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { PromptDialogComponent } from '../../shared/components';
import { DatabaseService, PresentationService } from '../../core/services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PromptDialogComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly db = inject(DatabaseService);
  private router = inject(Router);
  readonly presentation = inject(PresentationService);

  constructor() {
    effect(() => {
      console.log('Selected collection ID:', this.db.collectionId());
    });
  }

  currentUser: { name: string } | null = null;
  gravatarUrl = '';

  showCollectionDialog = false;

  handleCreateCollection(event: Event) {
    event.stopPropagation();
    this.showCollectionDialog = true;
  }

  onCollectionConfirmed(name: string) {
    this.db.collectionCreate({ title: name });
    this.showCollectionDialog = false;
  }

  onCollectionCancelled() {
    this.showCollectionDialog = false;
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
