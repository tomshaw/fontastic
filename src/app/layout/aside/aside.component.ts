import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit {

  componentName = 'tables';

  constructor() { }

  ngOnInit() { }

  onComponentSwitch(): void {
    this.componentName = (this.componentName === 'tables') ? 'search' : 'tables';
  }

}
