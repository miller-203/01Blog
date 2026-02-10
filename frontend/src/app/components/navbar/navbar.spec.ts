import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavbarComponent } from './navbar';
import { NotificationService } from '../../service/notification';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    const notificationServiceSpy = {
      getNotifications: vi.fn(() => of([])),
      markAsRead: vi.fn(() => of(void 0))
    } as unknown as NotificationService;

    const routerSpy = {
      navigate: vi.fn()
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
