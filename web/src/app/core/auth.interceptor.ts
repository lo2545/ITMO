import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');

  console.log('Interceptor - token:', token);
  console.log('Interceptor - isAuthenticated:', auth.isAuthenticated);

  if (token && auth['isTokenExpired']()) {
      localStorage.removeItem('token');
      auth['userSubject'].next(null);
      router.navigate(['/login'], {
        queryParams: {
          sessionExpired: true,
          message: 'Срок действия сессии истек'
        }
      });
      return throwError(() => new Error('Token expired'));
  }

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        auth['userSubject'].next(null);
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
