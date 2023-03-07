import { Injectable } from '@angular/core';
import { ModalComponent } from '@app/shared/components';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modals: ModalComponent[] = [];

  add(modal: ModalComponent): void {
    if (!modal.id) {
      throw new Error('Modal components must have a unique id attribute.');
    }

    if (!this.modals.find((item: ModalComponent) => item.id === modal.id)) {
      this.modals.push(modal);
    }
  }

  remove(modal: ModalComponent): void {
    this.modals = this.modals.filter((item: ModalComponent) => item === modal);
  }

  open(id: string): void {
    const modal = this.modals.find((item: ModalComponent) => item.id === id);
    modal?.open();
  }

  close(): void {
    const modal = this.modals.find((item: ModalComponent) => item.enabled);
    modal?.close();
  }
}
