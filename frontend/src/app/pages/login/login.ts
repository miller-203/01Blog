import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for *ngIf
import { FormsModule } from '@angular/forms';   // Important for [(ngModel)]
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth'; // Importing from auth.ts

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- We import modules HERE now
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  loginData = {
    username: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        // 1. Save the token
        this.authService.saveToken(response.token);
        console.log('Login Successful:', response);
        
        // 2. Navigate to Home (We will create this later)
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login Failed', err);
        alert('Invalid Username or Password');
      }
    });
  }
}