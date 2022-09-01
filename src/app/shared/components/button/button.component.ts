import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {

  @Input() type: string;
  @Input() text: string;
  @Input() ngClass: string;
  @Input() disabled: null;

  @Output() handlebuttonClick = new EventEmitter<any>();

  onButtonClick(event: MouseEvent): void {
    this.handlebuttonClick.emit(event);
  }
}
