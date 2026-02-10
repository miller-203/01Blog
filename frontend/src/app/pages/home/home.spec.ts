import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeComponent } from './home';
import { AuthService } from '../../service/auth';
import { PostService } from '../../service/post';
import { UserService } from '../../service/user';
import { NotificationService } from '../../service/notification';
import { ReportService } from '../../service/report';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let reportServiceSpy: Pick<ReportService, 'reportUser'>;

  beforeEach(async () => {
    const authServiceSpy = { getToken: vi.fn() } as unknown as Pick<AuthService, 'getToken'>;
    const routerSpy = { navigate: vi.fn() } as unknown as Pick<Router, 'navigate'>;
    const postServiceSpy = {
      getAllPosts: vi.fn(() => of([])),
      getComments: vi.fn(() => of([])),
      addComment: vi.fn(() => of({})),
      toggleLike: vi.fn(() => of({ liked: true, count: 1 }))
    } as unknown as PostService;
    const userServiceSpy = {
      getAllUsers: vi.fn(() => of([])),
      followUser: vi.fn(() => of({}))
    } as unknown as UserService;
    const notificationServiceSpy = {
      getNotifications: vi.fn(() => of([])),
      markAsRead: vi.fn(() => of(void 0))
    } as unknown as NotificationService;
    reportServiceSpy = { reportUser: vi.fn(() => of({})) } as unknown as Pick<ReportService, 'reportUser'>;

    await TestBed.configureTestingModule({
      // isolate class logic from template routing dependencies
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PostService, useValue: postServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy }
      ]
    });

    TestBed.overrideComponent(HomeComponent, {
      set: { template: '' }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should report user when reason is provided', () => {
    const user = { id: 2, username: 'alex' };
    component.reportReason[user.id] = 'spam';

    component.reportUser(user);

    expect(reportServiceSpy.reportUser).toHaveBeenCalledWith(2, 'spam');
  });

  it('should not call report API when reason is empty', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const user = { id: 5, username: 'sam' };
    component.reportReason[user.id] = '   ';

    component.reportUser(user);

    expect(reportServiceSpy.reportUser).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
