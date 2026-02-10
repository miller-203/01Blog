import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService } from '../../service/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: Pick<AuthService, 'login' | 'saveToken'>;
  let routerSpy: Pick<Router, 'navigate'>;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn(),
      saveToken: vi.fn()
    } as unknown as Pick<AuthService, 'login' | 'saveToken'>;

    routerSpy = {
      navigate: vi.fn()
    } as unknown as Pick<Router, 'navigate'>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save token and navigate to home on successful login', () => {
    vi.mocked(authServiceSpy.login as any).mockReturnValue(of({ token: 'jwt-token' }));

    component.onSubmit();

    expect(authServiceSpy.saveToken).toHaveBeenCalledWith('jwt-token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show alert on login failure', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    vi.mocked(authServiceSpy.login as any).mockReturnValue(throwError(() => ({ error: 'Unauthorized' })));

    component.onSubmit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
