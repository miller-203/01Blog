import { Component, signal, HostListener } from '@angular/core';
import { Header } from '../../components/header/header';
import { RouterOutlet } from '@angular/router';
import { SidebarLeft } from '../../components/sidebar-left/sidebar-left';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, SidebarLeft, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  @HostListener('document:click', ['$event'])
  closeSidebarOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close sidebar if click is outside on mobile/tablet
    if (this.isMobile() && this.isSidebarOpen() &&
        !target.closest('.sidebar') && !target.closest('.btn-hamburger')) {
      this.isSidebarOpen.set(false);
    }
  }
}
