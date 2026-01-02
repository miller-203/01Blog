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

  constructor(private postService: PostService, private router: Router) {}

  // Triggered when user picks an image
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    this.postService.createPost(this.title, this.content, this.selectedFile).subscribe({
      next: (res) => {
        console.log('Post Created:', res);
        alert('Post Published Successfully!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to create post.');
      }
    });
  }
}