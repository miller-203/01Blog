import { Component, inject, OnInit } from '@angular/core';
import { AdminNav } from '../../../components/admin-nav/admin-nav';
import { AdminService } from '../../../core/services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})

export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  status: any;

  ngOnInit(): void {
    this.adminService.getStatus().subscribe({
      next: (data) => this.status = data,
      error: (err) => console.error('Error loading status:', err)
    }); 
  }
}
