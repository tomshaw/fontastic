import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, PresentationService, DatabaseService } from '@app/core/services';
import { AuthService, GravatarService } from '@app/core/services';
import { AuthUser } from '@app/core/interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  currentUser: AuthUser;
  gravatarUrl: string;

  gridEnabled = true;
  toolbarEnabled = true;
  previewEnabled = true;
  inspectEnabled = true;
  navigationEnabled = true;
  asideEnabled = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
    private gravatar: GravatarService
  ) { }

  ngOnInit() { 
    this.authService.watchAuthUser$.subscribe((x: AuthUser) => {
      if (x && x.email) {
        this.currentUser = x;
        this.gravatarUrl = this.gravatar.url(x.email, 128, 'mm');
      }
    });
    this.presentationService._asideEnabled.subscribe((result) => {
      this.asideEnabled = result;
    });
    this.presentationService._navigationEnabled.subscribe((result) => {
      this.navigationEnabled = result;
    });
    this.presentationService._gridEnabled.subscribe((result) => {
      this.gridEnabled = result;
    });
    this.presentationService._toolbarEnabled.subscribe((result) => {
      this.toolbarEnabled = result;
    });
    this.presentationService._previewEnabled.subscribe((result) => {
      this.previewEnabled = result;
    });
    this.presentationService._inspectEnabled.subscribe((result) => {
      this.inspectEnabled = result;
    });
    this.presentationService._defaultTheme.subscribe((result) => this.enableTheme(result));
  }

  handleCreateCollection(e: any): void {
    this.messageService.createCollection(0).then(result => {
      this.databaseService.setCollection(result);
    });
  }

  handleLogout(event: Event): void {
    this.authService.logout();
    this.router.navigate(['/settings']);
  }

  handleToggleAside(event: Event): void {
    this.presentationService.setAsideEnabled(!this.asideEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleNavigation(event: Event): void {
    this.presentationService.setNavigationEnabled(!this.navigationEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleTogglePreview(event: Event): void {
    this.presentationService.setPreviewEnabled(!this.previewEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleInspect(event: Event): void {
    this.presentationService.setInspectEnabled(!this.inspectEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleToolbar(event: Event): void {
    this.presentationService.setToolbarEnabled(!this.toolbarEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleGrid(event: Event): void {
    this.presentationService.setGridEnabled(!this.gridEnabled);
    this.presentationService.saveLayoutSettings();
  }

  enableTheme(theme: string): void {
    const body = document.querySelector('body');
    const themes = this.presentationService.getThemes();
    if (themes.map(item => item.key).includes(theme)) {
      body.setAttribute('data-theme', theme);
    }
  }

  handleSwitchTheme(event: Event): void {
    const body = document.querySelector('body');
    const attr = body.getAttribute('data-theme');
    const themes = this.presentationService.getThemes();

    let idx = themes.map(item => item.key).indexOf(attr);

    if (idx < themes.length - 1) {
      idx++;
    } else {
      idx = 0;
    }

    if (themes[idx]) {
      const theme = themes[idx].key;
      body.setAttribute('data-theme', theme);
      this.presentationService.setTheme(theme);
      this.presentationService.setThemeDefaults(theme);
    }
  }
}
