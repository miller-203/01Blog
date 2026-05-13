import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Delimiter from '@editorjs/delimiter';
import ImageTool from '@editorjs/image';
import VideoTool from 'editorjs-video';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post.service';
import { parseEditorJsContent } from '../../../core/utils/editorjs-parser';
import { Popup } from '../../../components/popup/popup';
import { ErrorHandler } from '../../../core/utils/error-handler';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, Popup],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePost implements OnInit, OnDestroy {
  // Properties
  editor?: EditorJS;
  @ViewChild('popup') popup!: Popup;
  form: FormGroup;
  postId: string | null = null;
  title: string = '';

  // Dependency Injection
  constructor(
    private authService: AuthService,
    private postService: PostService,
    private http: HttpClient,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: '',
      content: ['']
    });
  }

  // ===== LIFECYCLE HOOKS =====
  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id');
    this.initializeEditor();

    if (this.postId) {
      this.loadExistingPost();
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  // ===== EDITOR CONFIGURATION =====
  private initializeEditor(): void {
    this.editor = new EditorJS({
      holder: 'editorjs',
      placeholder: 'Start writing your post...',
      tools: {
        header: Header,
        paragraph: Paragraph,
        delimiter: Delimiter,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: (file: File) => {
                const formData = new FormData();
                formData.append('image', file);
                return this.http.post<any>(
                  'http://localhost:8080/api/posts/upload-image',
                  formData,
                  { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                ).toPromise()
                  .then(res => ({ success: 1, file: { url: res.file.url } }))
                  .catch(() => ({ success: 0 }));
              }
            }
          }
        },
        video: {
          class: VideoTool,
          config: {
            uploader: {
              uploadByFile: (file: File) => {
                const formData = new FormData();
                formData.append('video', file);
                return this.http.post<any>(
                  'http://localhost:8080/api/posts/upload-video',
                  formData,
                  { headers: { Authorization: `Bearer ${this.authService.getAccessToken()}` } }
                ).toPromise()
                  .then(res => ({ success: 1, file: { url: res.file.url } }))
                  .catch(() => ({ success: 0 }));
              }
            }
          }
        }
      }
    });
  }

  // ===== POST OPERATIONS =====
  private loadExistingPost(): void {
    this.postService.getPostById(this.postId!).subscribe(async (post: any) => {

      this.form.patchValue({
        title: post.title,
        content: post.content
      });

      if (this.editor && post.content) {
        const parsed = parseEditorJsContent(post.content);
        if (post.content) {
          try {
            await this.editor.isReady;

            const parsed = parseEditorJsContent(post.content);

            this.title = post.title;
            this.editor.render({
              time: Date.now(),
              blocks: parsed.blocks,
              version: '2.28.0'
            });

          } catch (error) {
            console.error('Render error', error);
          }
        }
      }
    });
  }

  async savePost() {
    if (!this.editor) return;

    const output = await this.editor.save();

    const hasContent = output.blocks.some((block: any) => {
      if (block.type === 'paragraph' || block.type === 'header') {
        return block.data?.text?.replace(/<[^>]*>/g, '').trim().length > 0;
      }

      if (block.type === 'image' || block.type === 'video') {
        return !!block.data?.file?.url;
      }

      return true;
    });

    if (!this.title.trim() || !hasContent) {
      this.popup.show('Title and content cannot be empty.', false);
      return;
    }

    const postData = {
      title: this.title.trim(),
      content: JSON.stringify(output.blocks)
    };

    this.postService.createPost(postData).subscribe({
      next: res => {
        this.router.navigate(['/home'], { queryParams: { success: 'post-created' } });
      },
      error: err => this.popup.show(ErrorHandler.extractErrorMessage(err), false)
    });
  }

  async updatePost() {
    if (!this.editor) return;

    const output = await this.editor.save();
    const postData = {
      title: this.title,
      content: JSON.stringify(output.blocks)
    };

    if (this.postId) {
      this.postService.updatePost(this.postId, postData).subscribe({
        next: res => {
          this.popup.show('Post updated successfully.', true);
          this.router.navigate(['/posts', this.postId]);
        },
        error: err => this.popup.show(ErrorHandler.extractErrorMessage(err), false)
      });
    }
  }
}
