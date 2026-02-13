import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../service/post';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePostComponent {

  title: string = '';
  content: string = '';
  selectedFile: File | null = null;
  readonly maxFileSizeBytes = 5 * 1024 * 1024;

  constructor(private postService: PostService, private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0] as File | undefined;
    if (!file) {
      this.selectedFile = null;
      return;
    }

    if (file.size > this.maxFileSizeBytes) {
      alert('Image is too large. Please select an image smaller than 5MB.');
      event.target.value = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  private getErrorMessage(err: any): string {
    return err?.error?.message || err?.error || 'Failed to create post.';
  }

  onSubmit() {
    this.postService.createPost(this.title, this.content, this.selectedFile).subscribe({
      next: () => {
        alert('Post Published Successfully!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert(this.getErrorMessage(err));
      }
    });
  }
}
