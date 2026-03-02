import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  gridEnabled: boolean = true;
  toolbarEnabled: boolean = true;
  previewEnabled: boolean = true;
  inspectEnabled: boolean = true;

  constructor(
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
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
  }

}
