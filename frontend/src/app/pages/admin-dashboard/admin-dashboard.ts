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
  success = '';

  constructor(
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAll();
    }
  }

  private getErrorMessage(err: any, fallback: string) {
    return err?.error?.message || err?.error || fallback;
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.adminService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => {
        this.error = this.getErrorMessage(err, 'Unable to load admin data. Ensure you are logged in as ADMIN.');
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });

    this.adminService.getPosts().subscribe({
      next: (data) => (this.posts = data),
      error: (err) => (this.error = this.getErrorMessage(err, 'Unable to load posts.'))
    });

    this.adminService.getReports().subscribe({
      next: (data) => (this.reports = data),
      error: (err) => (this.error = this.getErrorMessage(err, 'Unable to load reports.'))
    });
  }

  banUser(id: number) {
    if (!confirm('Ban this user?')) return;

    this.adminService.banUser(id).subscribe({
      next: () => {
        this.success = 'User banned successfully.';
        this.loadAll();
      },
      error: (err) => (this.error = this.getErrorMessage(err, 'Failed to ban user.'))
    });
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user permanently?')) return;

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.success = 'User deleted successfully.';
        this.loadAll();
      },
      error: (err) => (this.error = this.getErrorMessage(err, 'Failed to delete user.'))
    });
  }

  deletePost(id: number) {
    if (!confirm('Remove this post?')) return;

    this.adminService.deletePost(id).subscribe({
      next: () => {
        this.success = 'Post removed successfully.';
        this.loadAll();
      },
      error: (err) => (this.error = this.getErrorMessage(err, 'Failed to remove post.'))
    });
  }

  resolveReport(id: number) {
    this.adminService.resolveReport(id).subscribe({
      next: () => {
        this.success = 'Report resolved successfully.';
        this.loadAll();
      },
      error: (err) => (this.error = this.getErrorMessage(err, 'Failed to resolve report.'))
    });
  }
}
