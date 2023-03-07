import { Component, OnInit } from '@angular/core';
import { ModalService } from '@app/core/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  componentName = 'general';

  constructor(
    private modalService: ModalService,
  ) { }

  ngOnInit(): void { }

  onComponentSwitch(componentName: string): void {
    this.componentName = componentName;
  }

}
