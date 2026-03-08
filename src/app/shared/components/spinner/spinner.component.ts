import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `<span class="app-spinner" [class.is-animating]="animating()"></span>`,
})
export class SpinnerComponent {
  readonly animating = input(false);
}
