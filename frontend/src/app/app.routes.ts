import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { CreatePostComponent } from './pages/create-post/create-post'; // <--- Import this
import { ProfileComponent } from './pages/profile/profile'; // Import
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];