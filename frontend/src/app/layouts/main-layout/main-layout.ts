import { Component, signal } from '@angular/core';
import { Header } from '../../components/header/header';
import { RouterOutlet } from '@angular/router';
import { SidebarRight } from '../../components/sidebar-right/sidebar-right';
import { SidebarLeft } from '../../components/sidebar-left/sidebar-left';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, SidebarRight, SidebarLeft, CommonModule],
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
}
