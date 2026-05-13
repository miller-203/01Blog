import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikeService } from '../../core/services/like.service';
import { Post } from '../../core/models/post';
import { DateUtilsService } from '../../core/services/utils/DateUtil.service';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.scss']
})
export class PostCard implements OnInit {
  // Input Properties
  @Input() post!: Post;

  // Display Properties
  authorName: string = '';
  authorAvatar?: string | null;
  excerpt: string = '';
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: string;

  // Injected Services
  private router = inject(Router);
  private likeService = inject(LikeService);
  private dateUtils = inject(DateUtilsService);

  // ===== LIFECYCLE HOOKS =====
  ngOnInit(): void {
    if (!this.post) return;

    this.initializeAuthorInfo();
    this.initializePostContent();
  }

  // ===== INITIALIZATION METHODS =====
  private initializeAuthorInfo(): void {
    const first = this.post.authorFirstName ?? '';
    const last = this.post.authorLastName ?? '';
    this.authorName = `${first} ${last}`.trim() || (this.post.authorName ?? '');
    const rawAvatar = this.post.authorAvatar ?? this.post.authorImage ?? null;
    this.authorAvatar = this.normalizeAvatar(rawAvatar);
    // this.authorAvatar = "http://localhost:8080/uploads/" + this.authorAvatar;  
    this.createdAt = this.dateUtils.getTimeAgo(this.post.createdAt);
  }

  private initializePostContent(): void {
    const blocks = this.extractBlocks();
    this.extractImageUrl(blocks);
    this.extractVideoUrl(blocks);
    this.extractExcerpt(blocks);
  }

  private extractBlocks(): any[] {
    if (this.post.parsedContent?.blocks && Array.isArray(this.post.parsedContent.blocks)) {
      return this.post.parsedContent.blocks;
    }

    try {
      const parsed = JSON.parse(this.post.content || '');
      return Array.isArray(parsed) ? parsed : parsed?.blocks ?? [];
    } catch (e) {
      return [];
    }
  }

  private extractImageUrl(blocks: any[]): void {
    const imageBlock = blocks.find(b => b.type === 'image');
    this.imageUrl = imageBlock?.data?.file?.url ?? imageBlock?.data?.url ?? null;
  }

  private extractVideoUrl(blocks: any[]): void {
    const videoBlock = blocks.find(b => b.type === 'video');
    this.videoUrl = videoBlock?.data?.file?.url ?? videoBlock?.data?.url ?? null;
  }

  private extractExcerpt(blocks: any[]): void {
    const paragraphBlock = blocks.find(b => b.type === 'paragraph' && b.data?.text);
    
    if (paragraphBlock) {
      this.excerpt = this.stripHtml(paragraphBlock.data.text).trim();
    } else {
      const headerBlock = blocks.find(b => b.type === 'header' && b.data?.text);
      this.excerpt = headerBlock ? this.stripHtml(headerBlock.data.text).trim() : (this.post.title ?? '');
    }

    // Limit excerpt length for card display
    if (this.excerpt.length > 200) {
      this.excerpt = this.excerpt.slice(0, 197).trim() + '...';
    }
  }

  // ===== USER ACTIONS =====
  onLike(): void {
    if (!this.post) return;
    this.likeService.toggleLike(this.post.id).subscribe({
      next: (res: any) => {
        if (this.post) {
          this.post.liked = res.liked;
          this.post.likesCount = res.likesCount ?? res.count;
        }
      },
      error: (err) => console.error('Like error', err)
    });
  }

  onComments(): void {
    this.router.navigate(['/posts', this.post.id]);
  }

  // ===== UTILITY METHODS =====
  private stripHtml(s: string): string {
    return String(s).replace(/<[^>]*>/g, '');
  }
   private normalizeAvatar(value: unknown): string | null {
    const avatar = String(value ?? '').trim();
    if (!avatar || avatar.toLowerCase() === 'false' || avatar.toLowerCase() === 'null') {
      return null;
    }
    if (/^https?:\/\//i.test(avatar) || avatar.startsWith('/')) {
      return avatar;
    }

    const origin = environment.apiUrl.replace(/\/api\/?$/, '');
    const normalizedPath = avatar.startsWith('uploads/') ? avatar : `uploads/${avatar}`;
    return `${origin}/${normalizedPath}`;
  }
}
