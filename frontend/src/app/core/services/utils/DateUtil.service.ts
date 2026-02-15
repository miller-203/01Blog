import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  
  /**
   * Convert a date to relative time (e.g., "5 minutes ago", "2 hours ago")
   */
  getTimeAgo(date: string | Date | undefined): string {
    if (!date) return '';

    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    
    // Handle future dates
    if (diffMs < 0) return 'just now';
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 30) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffMonths < 12) {
      return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    } else {
      return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
    }
  }

  /**
   * Format date to readable string (e.g., "Jan 15, 2025")
   */
  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Check if date is today
   */
  isToday(date: string | Date | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    const check = new Date(date);
    return today.toDateString() === check.toDateString();
  }
}