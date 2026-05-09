import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user';
import { ReportUserPopup } from '../../components/report-user-popup/report-user-popup';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { PostService } from '../../core/services/post.service';
import { PostCard } from '../../components/post-card/post-card';
import { parseEditorJsContent } from '../../core/utils/editorjs-parser';
import { Popup } from '../../components/popup/popup';
import { ErrorHandler } from '../../core/utils/error-handler';


@Component({
  selector: 'app-profile',
  imports: [ReportUserPopup, CommonModule, FormsModule, PostCard, Popup],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  // Properties
  @ViewChild('popup') popup!: Popup;
  user?: User;
  currentUsername?: string;
  isFollowing: boolean = false;
  isLoading: boolean = false;
  showEditPopup: boolean = false;
  showMenu: boolean = false;
  showReportPopup: boolean = false;
  posts: any[] = [];


  editForm = {
    firstName: '',
    lastName: '',
    bio: '',
    avatar: null as File | null,
    avatarPreview: '',
    cover: null as File | null,
    coverPreview: ''
  };


  reportForm = {
    reason: ''
  };


  // Injected Services
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  private postService = inject(PostService);
  private router = inject(Router);


  // ===== LIFECYCLE HOOKS =====
  ngOnInit(): void {
    this.currentUsername = this.route.snapshot.paramMap.get('username') || '';


    if (this.currentUsername) {
      this.loadUserProfile();
    }
  }


  ngOnChanges(): void {
    if (this.user && !this.user.currentUser) {
      this.checkFollowStatus();
    }
  }


  // ===== USER PROFILE OPERATIONS =====
  loadUserProfile(): void {
    if (!this.currentUsername) return;


    this.userService.getUserByUsername(this.currentUsername).subscribe({
      next: (user) => {
        this.user = user;
        if (!user.currentUser) {
          this.checkFollowStatus();
        }
        this.loadUserPosts();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.popup.show('Failed to load user profile. Please try again.', false);
      }
    });
  }


  checkFollowStatus(): void {
    if (!this.user) return;
    this.userService.isFollowing(this.user.id).subscribe({
      next: (isFollowing) => {
        this.isFollowing = isFollowing;
      },
      error: (err) => {
        console.error('Error checking follow status:', err);
      }
    });
  }


  // ===== FOLLOW ACTIONS =====
  onFollowClick(): void {
    if (!this.user || this.isLoading) return;


    this.isLoading = true;
    const action = this.isFollowing ? this.userService.unfollow(this.user.id) : this.userService.follow(this.user.id);


    action.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        // Update follower count
        if (this.isFollowing) {
          this.user!.followersCount++;
          this.popup.show('Successfully followed!', true);
        } else {
          this.user!.followersCount--;
          this.popup.show('Successfully unfollowed!', true);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error following/unfollowing user:', err);
        this.popup.show(ErrorHandler.extractErrorMessage(err), false);
        this.isLoading = false;
      }
    });
  }


  // ===== POST OPERATIONS =====
  loadUserPosts(): void {
    if (!this.user) return;


    this.postService.getPostsByUser(this.user.id).subscribe({
      next: (posts: any[]) => {
        this.posts = posts.map(post => ({
          ...post,
          parsedContent: parseEditorJsContent(post.content)
        }));
      },
      error: (err) => {
        console.error('Error fetching user posts:', err);
        this.popup.show('Failed to load posts. Please try again.', false);
      }
    });
  }


  // ===== EDIT PROFILE ACTIONS =====
  onEditProfile() {
    if (this.user) {
      this.editForm = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        bio: this.user.bio || '',
        avatar: null,
        avatarPreview: this.user.avatarUrl || '',
        cover: null,
        coverPreview: (this.user as any).coverUrl || ''
      };
    }
    this.showEditPopup = true;
  }


  closeEditPopup() {
    this.showEditPopup = false;
    this.editForm.avatar = null;
    this.editForm.avatarPreview = '';
  }


  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editForm.avatar = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editForm.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  submitEditProfile(): void {
    if (!this.user) return;


    console.log("this.editForm", this.editForm);


    const formData = new FormData();


    // Always add profile data
    formData.append('firstName', this.editForm.firstName);
    formData.append('lastName', this.editForm.lastName);
    formData.append('bio', this.editForm.bio);


    // Add avatar if present
    if (this.editForm.avatar) formData.append('avatar', this.editForm.avatar);
    if (this.editForm.cover) formData.append('cover', this.editForm.cover);


    this.userService.updateProfile(formData).subscribe({
      next: () => {
        this.closeEditPopup();
        this.loadUserProfile();
        this.popup.show('Profile updated successfully!', true);
      },
      error: (err: any) => {
        console.error('Error updating profile:', err);
        this.popup.show(ErrorHandler.extractErrorMessage(err), false);
      }
    });


  }


  // ===== MENU & REPORT ACTIONS =====
  onMenuKlick() {
    this.showMenu = !this.showMenu;
  }


  onCoverChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editForm.cover = file;
      const reader = new FileReader();
      reader.onload = (e) => this.editForm.coverPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  onShareClick() {
    const link = window.location.href;


    navigator.clipboard.writeText(link).then(() => {
      this.popup.show('Link copied to clipboard!', true);
      this.showMenu = false;
    }).catch(err => {
      console.error('Failed to copy link:', err);
      this.popup.show('Failed to copy link. Please try again.', false);
    });
  }


  onReportClick() {
    this.showReportPopup = true;
    this.showMenu = false;
  }


  closeReportPopup() {
    this.showReportPopup = false;
  }


  submitReportUser() {
    if (!this.user || !this.reportForm.reason.trim()) return;


    console.log("Report submitted");


    this.reportService.reportUser(this.user.id, this.reportForm.reason).subscribe({
      next: () => {
        this.popup.show('Report submitted successfully!', true);
        this.closeReportPopup();
        this.reportForm.reason = '';
      },
      error: (err) => {
        console.error('Error submitting report:', err);
        this.popup.show(ErrorHandler.extractErrorMessage(err), false);
      }
    });
  }
}
