import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Home } from './features/dashboard/home/home';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AdminUsers } from './features/admin/admin-users/admin-users';
import { AdminPosts } from './features/admin/admin-posts/admin-posts';
import { AdminReports } from './features/admin/admin-reports/admin-reports';
import { SavedPosts } from './features/saved-posts/saved-posts';
import { Settings } from './features/settings/settings';
import { Notifications } from './features/notifications/notifications';
import { authGuard } from './core/guard/auth-guard';
import { adminGuard } from './core/guard/admin-guard';
import { noAuthGuard } from './core/guard/no-auth-guard';
import { CreatePost } from './features/posts/create-post/create-post';
import { PostDetail } from './features/posts/post-detail/post-detail';
import { Profile } from './features/profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [noAuthGuard],
    children: [
      { path: '', component: Login },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ]
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'home/fallowd-posts', component: Home },
      { path: 'saved-posts', component: SavedPosts },
      { path: 'settings', component: Settings },
      { path: 'notifications', component: Notifications },
      { path: 'create-post', component: CreatePost },
      { path: 'edit-post/:id', component: CreatePost },
      { path: 'posts/:id', component: PostDetail },
      { path: 'profile/:username', component: Profile },

      {
        path: 'admin',
        component: AdminLayout,
        canActivate: [authGuard, adminGuard],
        children: [
          { path: '', component: AdminDashboard },
          { path: 'users', component: AdminUsers },
          { path: 'posts', component: AdminPosts },
          { path: 'reports', component: AdminReports },
        ]
      }
    ]
  },

  { path: '**', redirectTo: '' }
];