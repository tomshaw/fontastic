import { Component } from '@angular/core';
import { ModalService } from '@app/core/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  componentName = 'general';

  constructor(
    private modalService: ModalService,
  ) { }

  onComponentSwitch(componentName: string): void {
    this.componentName = componentName;
  }

}
