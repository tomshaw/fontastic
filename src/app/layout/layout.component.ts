import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  navigationEnabled: boolean = true;
  asideEnabled: boolean = true;

  constructor(
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.presentationService._navigationEnabled.subscribe((result) => {
      this.navigationEnabled = result;
    });
    this.presentationService._asideEnabled.subscribe((result) => {
      this.asideEnabled = result;
    });
  }

}
