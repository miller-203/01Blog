import { Component, inject, Input, HostBinding, OnInit, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCard } from '../profile-card/profile-card';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Popup } from '../popup/popup';

@Component({
  selector: 'app-sidebar-left',
  standalone: true,
  imports: [CommonModule, ProfileCard, RouterLink, RouterLinkActive, Popup],
  templateUrl: './sidebar-left.html',
  styleUrl: './sidebar-left.scss'
})
export class SidebarLeft implements OnInit, OnDestroy {
  // Properties
  @ViewChild('popup') popup!: Popup;
  user?: User;
  isAdmin = false;
  isOpen = signal(false);
  
  // Input Properties
  @Input() isOpenInput = false;

  private authService = inject(AuthService);

  // RxJS Cleanup
  private destroy$ = new Subject<void>();

  // Injected Services
  private userService = inject(UserService);

  // ===== HOST BINDINGS =====
  @HostBinding('class.open')
  get isOpenClass() {
    return this.isOpenInput || this.isOpen();
  }

  // ===== LIFECYCLE HOOKS =====
  ngOnInit(): void {
    this.loadCurrentUser();
    this.userService.followCountChanges$
      .pipe(takeUntil(this.destroy$))
       .subscribe(() => {
        this.loadCurrentUser();
      });

    this.userService.followToast$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ message, success }) => {
        this.popup?.show(message, success, 'sidebar-left');
      });
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
  logout() {
    console.log('Logout clicked');
    this.isOpen.set(false);
    console.log('Logging out user');
    this.authService.logout();
  }
}
