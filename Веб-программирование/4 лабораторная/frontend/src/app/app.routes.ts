import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    return true;
  }
  return router.parseUrl('/login');
};

const redirectToMainIfAuth = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    return router.parseUrl('/main');
  }
  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [redirectToMainIfAuth] },
  { path: 'main', component: MainComponent, canActivate: [authGuard] },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/main' }
];
