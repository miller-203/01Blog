import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService } from '../../service/admin';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  posts: any[] = [];
  reports: any[] = [];

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
    this.adminService.getUsers().subscribe((data) => (this.users = data));
    this.adminService.getPosts().subscribe((data) => (this.posts = data));
    this.adminService.getReports().subscribe((data) => (this.reports = data));
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
