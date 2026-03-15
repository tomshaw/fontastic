import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalBackdropDirective } from '../../directives/modal-backdrop/modal-backdrop.directive';

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [FormsModule, ModalBackdropDirective],
  templateUrl: './prompt-dialog.component.html',
})
export class PromptDialogComponent implements AfterViewInit {
  @Input() title = 'Prompt';
  @Input() placeholder = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('promptInput') promptInput!: ElementRef<HTMLInputElement>;

  value = '';

  ngAfterViewInit(): void {
    this.promptInput.nativeElement.focus();
  }

  confirm(): void {
    const trimmed = this.value.trim();
    if (trimmed) {
      this.confirmed.emit(trimmed);
      this.value = '';
    }
  }

  cancel(): void {
    this.value = '';
    this.cancelled.emit();
  }
}
