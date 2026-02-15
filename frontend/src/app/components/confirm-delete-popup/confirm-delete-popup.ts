import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-popup',
  imports: [CommonModule],
  templateUrl: './confirm-delete-popup.html',
  styleUrl: './confirm-delete-popup.scss'
})
export class ConfirmDeletePopup {
  // Input Properties
  @Input() show: boolean = false;
  @Input() title: string = 'Confirm Delete';
  @Input() message: string = 'Are you sure you want to delete this item?';
  @Input() item: any = null;
  @Input() confirmButtonText: string = 'Delete';

  // Output Events
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // ===== EVENT HANDLERS =====
  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
