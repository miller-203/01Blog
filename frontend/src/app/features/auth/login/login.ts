import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserLogin } from '../../../core/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Popup } from '../../../components/popup/popup';
import { finalize } from 'rxjs';
import { ErrorHandler } from '../../../core/utils/error-handler';

@Component({
  selector: 'app-login',
  imports: [RouterLink, CommonModule, FormsModule, Popup],
  templateUrl: './login.html',
  styleUrl: '../../../../styles/auth.scss'
})
export class Login {
  @ViewChild('popup') popup!: Popup;
  
  passwordVisible = false;
  isSubmitting = false;
  
  userLogin: UserLogin = {
    username: '',
    password: ''
  };

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit(): void {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;

    this.authService.login(this.userLogin)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.popup.show('Login successful.', true);
          setTimeout(() => this.router.navigate(['/home']), 300);
        },
        error: (err) => {
          const errorMessage = ErrorHandler.extractErrorMessage(
            err, 
            'Login failed. Please try again.'
          );
          this.popup.show(errorMessage, false);
        }
      });
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
