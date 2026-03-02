import { Component, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  isActivated: boolean = false;
  loadingMessage: string = '';

  constructor(
    private presentationService: PresentationService
  ) {
  }

  ngOnInit() {
    this.presentationService._loadingSpinner.subscribe((status: boolean) => {
      if (status) {
        this.isActivated = status;
      } else {
        setTimeout(() => {
          this.isActivated = status;
        }, 1e3 / 3);
      }
    });

    this.presentationService._loadingMessage.subscribe((message: string) => {
      this.loadingMessage = message;
    });
  }

}
