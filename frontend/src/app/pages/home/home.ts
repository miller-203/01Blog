import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth'; // Ensure path is correct
import { jwtDecode } from 'jwt-decode'; // We use this to read the token

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  username: string = 'User';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.username = decoded.sub; // 'sub' holds the username in JWT
      } catch (error) {
        console.error('Invalid token');
      }
    } else {
      // If no token, kick them back to login
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('token'); // Destroy the key
    this.router.navigate(['/login']); // Go back to login
  }
}