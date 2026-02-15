import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-user-popup',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-user-popup.html',
  styleUrl: './report-user-popup.scss'
})
export class ReportUserPopup {
  // Input Properties
  @Input() show: boolean = false;
  @Input() reason: string = '';

  // Output Events (Two-Way Binding Pattern)
  @Output() reasonChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  // ===== EVENT HANDLERS =====
  onReasonChange() {
    this.reasonChange.emit(this.reason);
  }

  onClose() {
    this.close.emit();
  }
}
