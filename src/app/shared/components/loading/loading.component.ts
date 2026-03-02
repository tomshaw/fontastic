import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  isActivated = false;

  constructor(
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.presentationService._loadingScreen.subscribe((status: boolean) => {
      if (status) {
        this.isActivated = status;
      } else {
        setTimeout(() => this.isActivated = status, 1e3 / 3);
      }
    });
  }
}
