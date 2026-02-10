import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';
import { RegisterComponent } from './register';
import { AuthService } from '../../service/auth';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: Pick<AuthService, 'register'>;
  let routerSpy: Pick<Router, 'navigate'>;

  beforeEach(async () => {
    authServiceSpy = { register: vi.fn() } as unknown as Pick<AuthService, 'register'>;
    routerSpy = { navigate: vi.fn() } as unknown as Pick<Router, 'navigate'>;

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login after successful registration', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    vi.mocked(authServiceSpy.register as any).mockReturnValue(of('ok'));

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(window.alert).toHaveBeenCalled();
  });

  it('should show alert on registration failure', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    vi.mocked(authServiceSpy.register as any).mockReturnValue(throwError(() => ({ error: 'failed' })));

    component.onSubmit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
