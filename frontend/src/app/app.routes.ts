import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { CreatePostComponent } from './pages/create-post/create-post'; // <--- Import this

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'create-post', component: CreatePostComponent }, // <--- Add this route
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];