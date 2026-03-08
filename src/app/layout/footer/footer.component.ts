import { Component, inject } from '@angular/core';
import { SpinnerComponent } from '../../shared/components';
import { PresentationService } from '../../core/services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly presentation = inject(PresentationService);
}
