import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() modalTitle: string = "Settings";
  @Output() goSubmit = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  onClickSubmit(data: any): void {
    //e.preventDefault();
    this.goSubmit.emit(data);
  }

}
