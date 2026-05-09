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
  isSidebarOpen = signal(false);
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
          this.closeSidebar();
        }
      });
  }

  toggleSidebar() {
    if (!this.showUsersSidebar()) {
      return;
    }
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }
}
