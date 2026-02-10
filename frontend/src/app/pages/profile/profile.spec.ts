import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileComponent } from './profile';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    const authServiceSpy = { getProfile: vi.fn(() => of({ username: 'test' })) } as unknown as AuthService;
    const postServiceSpy = {
      getAllPosts: vi.fn(() => of([])),
      deletePost: vi.fn(() => of({})),
      updatePost: vi.fn(() => of({}))
    } as unknown as PostService;

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PostService, useValue: postServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start editing with selected post values', () => {
    const post = { id: 10, title: 'title', content: 'body' };

    component.startEditing(post);

    expect(component.editingPostId).toBe(10);
    expect(component.editTitle).toBe('title');
    expect(component.editContent).toBe('body');
  });
});
