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

  @Output() handleButtonClick = new EventEmitter<any>();

  constructor() { }

  onButtonClick(event: MouseEvent): void {
    this.handleButtonClick.emit(event);
  }
}
