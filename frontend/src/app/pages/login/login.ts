import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login Failed', err);
        alert('Invalid Username or Password');
      }
    });
  }
}