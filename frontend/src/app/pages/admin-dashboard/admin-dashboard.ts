import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../service/admin';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  posts: any[] = [];
  reports: any[] = [];
  loading = false;
  error = '';

  constructor(
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAll();
    }
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.adminService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => {
        this.error = err?.error?.message || 'Unable to load admin data. Ensure you are logged in as ADMIN.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });

    this.adminService.getPosts().subscribe({ next: (data) => (this.posts = data) });
    this.adminService.getReports().subscribe({ next: (data) => (this.reports = data) });
  }

  banUser(id: number) {
    this.adminService.banUser(id).subscribe(() => this.loadAll());
  }

  deleteUser(id: number) {
    this.adminService.deleteUser(id).subscribe(() => this.loadAll());
  }

  deletePost(id: number) {
    this.adminService.deletePost(id).subscribe(() => this.loadAll());
  }

  resolveReport(id: number) {
    this.adminService.resolveReport(id).subscribe(() => this.loadAll());
  }
}
