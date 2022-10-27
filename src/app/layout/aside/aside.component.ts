import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit {

  componentName = 'tables';

  constructor(
    private presentationService: PresentationService,
  ) { }

  ngOnInit() { 
    this.presentationService._asideComponent.subscribe((value: string) => this.componentName = value);
  }

  onComponentSwitch(): void {
    const componentName = (this.componentName === 'tables') ? 'search' : 'tables';
    this.presentationService.setAsideComponent(componentName);
    this.presentationService.saveLayoutSettings();
  }

}
