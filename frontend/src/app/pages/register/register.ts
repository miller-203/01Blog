import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth'; // Ensure this path matches your file

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {

  registerData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.registerData).subscribe({
      next: (response: any) => {
        console.log('Registration Successful:', response);
        alert('Registration Successful! Please Login.');
        this.router.navigate(['/login']); // Redirect to login page
      },
      error: (err) => {
        console.error('Registration Failed', err);
        alert('Registration Failed: ' + (err.error || 'Unknown Error'));
      }
    });
  }
}