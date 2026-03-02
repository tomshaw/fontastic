import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit {

  componentName = 'tables';
  componentList = ['tables', 'search', 'store'];

  constructor(
    private presentationService: PresentationService,
  ) { }

  ngOnInit() {
    this.presentationService._asideComponent.subscribe((value: string) => this.componentName = this.componentList.includes(value) ? value : this.componentName);
  }

  onComponentSwitch(): void {
    this.componentName = (this.componentName === 'tables') ? 'store' : 'tables';
    this.presentationService.setAsideComponent(this.componentName);
  }
}
