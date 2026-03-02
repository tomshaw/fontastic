import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '@app/core/services';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() id?: string;
  @Input() title = 'Modal';
  @Input() size = 'sm';
  @Input() rounded = 'rounded-none';
  @Input() shadow = 'shadow-none';

  @Input() showHeader = true;
  @Input() showFooter = true;

  enabled = false;

  private element: any;

  constructor(
    private modalService: ModalService,
    private el: ElementRef
  ) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    this.modalService.add(this);
    document.body.appendChild(this.element);
  }

  ngOnDestroy() {
    this.modalService.remove(this);
    this.element.remove();
  }

  addContentStyles() {
    return [this.rounded, this.shadow];
  }

  open() {
    this.enabled = true;
  }

  close() {
    this.enabled = false;
  }
}
