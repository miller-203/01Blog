import { Component, inject, Input, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCard } from '../profile-card/profile-card';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar-left',
  standalone: true,
  imports: [CommonModule, ProfileCard, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-left.html',
  styleUrl: './sidebar-left.scss'
})
export class SidebarLeft implements OnInit, OnDestroy {
  // Properties
  user?: User;
  isAdmin = false;
  
  // Input Properties
  @Input() isOpen = false;

  // RxJS Cleanup
  private destroy$ = new Subject<void>();

  // Injected Services
  private userService = inject(UserService);

  // ===== HOST BINDINGS =====
  @HostBinding('class.open')
  get isOpenClass() {
    return this.isOpen;
  }

  // ===== LIFECYCLE HOOKS =====
  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== DATA LOADING =====
  private loadCurrentUser(): void {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          const normalizedRole = (user.role || "").toUpperCase();
          this.isAdmin = normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
          console.log("user ::::::", user);
        },
        error: (err) => {
          console.error('Error fetching user:', err);
        }
      });
  }
}
