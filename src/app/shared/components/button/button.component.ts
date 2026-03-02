import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @Input('type') type!: string;
  @Input('title') text: string = '';
  @Input('style') style!: string;
  @Input('disabled') disabled!: null;

  @Output() onClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void { }

  onClickButton(event: MouseEvent): void {
    this.onClick.emit(event);
  }
}
