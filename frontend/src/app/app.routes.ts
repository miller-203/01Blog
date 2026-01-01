import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login'; // (or ./pages/login/login if you renamed it)
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home'; // <--- Import this

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent }, // <--- Add this line
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];