import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  navigationEnabled = true;
  asideEnabled = true;

  constructor(
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.presentationService._navigationEnabled.subscribe((result) => this.navigationEnabled = result);
    this.presentationService._asideEnabled.subscribe((result) => this.asideEnabled = result);
  }

}
