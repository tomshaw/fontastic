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
  ) {
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

  ngOnInit() { }

  handleCreateCollection(e: any): void {
    this.messageService.createCollection(0).subscribe(result => {
      this.databaseService.setCollection(result);
    });
  }

  handleLogout(e: any) {
    this.authService.logout();
    this.router.navigate(['/settings']);
  }

  handleToggleAside(e: any) {
    this.presentationService.setAsideEnabled(!this.asideEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleNavigation(e: any) {
    this.presentationService.setNavigationEnabled(!this.navigationEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleTogglePreview(e: any) {
    this.presentationService.setPreviewEnabled(!this.previewEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleInspect(e: any) {
    this.presentationService.setInspectEnabled(!this.inspectEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleToolbar(e: any) {
    this.presentationService.setToolbarEnabled(!this.toolbarEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleGrid(e: any) {
    this.presentationService.setGridEnabled(!this.gridEnabled);
    this.presentationService.saveLayoutSettings();
  }

  enableTheme(theme: string) {
    const body = document.querySelector('body');
    const themes = this.presentationService.getThemes();
    if (themes.map(item => item.key).includes(theme)) {
      body.setAttribute('data-theme', theme);
    }
  }

  handleSwitchTheme(e: any) {
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

  onSubmit(data: any) { }
}
