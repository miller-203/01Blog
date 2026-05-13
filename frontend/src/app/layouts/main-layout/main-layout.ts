import { Component, computed, inject, signal } from '@angular/core';
import { Header } from '../../components/header/header';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarRight } from '../../components/sidebar-right/sidebar-right';
import { SidebarLeft } from '../../components/sidebar-left/sidebar-left';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, SidebarRight, SidebarLeft, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  isRightSidebarOpen = signal(false);
  isLeftSidebarOpen = signal(false);
  currentUrl = signal('');

  private router = inject(Router);

  showUsersSidebar = computed(() => {
    const url = this.currentUrl();
     return !['/', '/login', '/register'].includes(url);
  });

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        if (!this.showUsersSidebar()) {
          this.closeSidebars();
        }
      });
  }

  toggleRightSidebar() {
    if (!this.showUsersSidebar()) return;
    this.isLeftSidebarOpen.set(false);
    this.isRightSidebarOpen.update(v => !v);
  }

  toggleLeftSidebar() {
    if (!this.showUsersSidebar()) return;
    this.isRightSidebarOpen.set(false);
    this.isLeftSidebarOpen.update(v => !v);
  }

  closeSidebars() {
    this.isRightSidebarOpen.set(false);
    this.isLeftSidebarOpen.set(false);
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }
}
