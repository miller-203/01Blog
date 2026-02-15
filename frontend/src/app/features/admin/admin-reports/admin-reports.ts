import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ReportResponse } from '../../../core/models/report';
import { ConfirmDeletePopup } from '../../../components/confirm-delete-popup/confirm-delete-popup';
import { Popup } from '../../../components/popup/popup';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, ConfirmDeletePopup, Popup],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss'
})
export class AdminReports implements OnInit {
  @ViewChild('popup') popup!: Popup;
  reports: ReportResponse[] = [];
  filteredReports: ReportResponse[] = [];
  selectedReport: ReportResponse | null = null;
  selectedStatus = 'All Reports';
  private adminService = inject(AdminService);
  showDeletePostPopup = false;
  postToDelete: { postId: string; reportId: string } | null = null;
  showBanUserPopup = false;
  userToBan: { userId: string; reportId: string } | null = null;

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.adminService.getAllReports().subscribe({
      next: (reports) => {
        console.log(reports);

        this.reports = reports;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading reports:', error);
      }
    });
  }

  onStatusFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.applyFilters();
  }

  applyFilters() {
    if (this.selectedStatus === 'All Reports') {
      this.filteredReports = this.reports;
    } else {
      this.filteredReports = this.reports.filter(report => report.status === this.selectedStatus.toUpperCase());
    }
  }

  onViewClick(report: ReportResponse) {
    this.selectedReport = report;
    console.log("on View Click", this.selectedReport);
  }

  closeModal() {
    this.selectedReport = null;
  }


  onDeletePostClick(postId: string, reportId: string) {
    this.postToDelete = { postId, reportId };
    this.showDeletePostPopup = true;
  }

  confirmDeletePost() {
    if (this.postToDelete) {
      this.adminService.deletePost(this.postToDelete.postId).subscribe({
        next: () => {
          // Remove the report from the list after deleting the post
          this.reports = this.reports.filter(r => r.reportId !== this.postToDelete!.reportId);
          this.applyFilters();
          this.showDeletePostPopup = false;
          this.postToDelete = null;
          this.popup.show('Post deleted successfully.', true);
        },
        error: (err: any) => {
          console.error(err);
          this.showDeletePostPopup = false;
          this.postToDelete = null;
          this.popup.show('Failed to delete post.', false);
        }
      });
    }
  }

  cancelDeletePost() {
    this.showDeletePostPopup = false;
    this.postToDelete = null;
  }

onBanUserClick(userId: string, reportId: string) {
  this.userToBan = { userId, reportId };
  this.showBanUserPopup = true;
}

confirmBanUser() {
  if (this.userToBan) {
    this.adminService.banUserFromReport(this.userToBan.reportId, this.userToBan.userId).subscribe({
      next: (updatedReport) => {
        // Update the local list
        this.reports = this.reports.map(r =>
          r.reportId === updatedReport.reportId ? updatedReport : r
        );
        this.applyFilters();
        this.showBanUserPopup = false;
        this.userToBan = null;
        this.popup.show('User banned successfully.', true);
      },
      error: (err) => {
        console.error(err);
        this.showBanUserPopup = false;
        this.userToBan = null;
        this.popup.show('Failed to ban user.', false);
      }
    });
  }
}

cancelBanUser() {
  this.showBanUserPopup = false;
  this.userToBan = null;
}

  onDismissClick(reportId: string) {
    this.adminService.putDismiss(reportId).subscribe({
      next: (updatedReport) => {
        // Update the local list
        this.reports = this.reports.map(r =>
          r.reportId === updatedReport.reportId ? updatedReport : r
        );
      },
      error: (err) => {
        console.error(err);
        alert('Failed to dismiss report');
      }
    });
  }

  truncateReason(reason: string): string {
    if (reason.length > 50) {
      return reason.slice(0, 50) + '...';
    }
    return reason;
  }
}
