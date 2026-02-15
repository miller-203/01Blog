import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  // Properties
  message = '';
  type: 'success' | 'error' = 'success';
  visible = false;

  // ===== PUBLIC API =====
  show(message: string, type: boolean): void {
    this.message = message;
    this.type = type ? 'success' : 'error';
    this.visible = true;

    setTimeout(() => this.visible = false, 3000);
  }
}
