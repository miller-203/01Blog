import { Component, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserRegister } from '../../../core/models/user';
import { CommonModule } from '@angular/common';
import { ErrorHandler } from '../../../core/utils/error-handler';
import { Popup } from '../../../components/popup/popup';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterLink, Popup],
  templateUrl: './register.html',
  styleUrl: '../../../../styles/auth.scss'
})
export class Register {
  @ViewChild('popup') popup!: Popup;
  
  passwordVisible = false;
  isSubmitting = false;
  
  userRegister: UserRegister = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    password: '',
    avatar: null
  };

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit(): void {
    if (this.isSubmitting) return;
    
    // Validate empty fields
    if (!this.userRegister.username.trim() || 
        !this.userRegister.firstName.trim() || 
        !this.userRegister.lastName.trim() || 
        !this.userRegister.email.trim() || 
        !this.userRegister.password.trim()) {
      this.popup.show('Please fill in all fields.', false);
      return;
    }

    // Basic email validation
    if (!this.isValidEmail(this.userRegister.email)) {
      this.popup.show('Please enter a valid email address.', false);
      return;
    }

    this.isSubmitting = true;

    this.authService.register(this.userRegister)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('access_token', res.token || res.accessToken);
          this.popup.show('Registration successful.', true);
          setTimeout(() => this.router.navigate(['/home']), 300);
        },
        error: (err) => {
          const errorMessage = ErrorHandler.extractErrorMessage(
            err,
            'Registration failed. Please try again.'
          );
          console.log("err >>>>>>>>", err);
          this.popup.show(errorMessage, false);
        }
      });
  }


  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.userRegister.avatar = input.files?.[0] ?? null;
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
    return emailPattern.test(email);
  }
}
