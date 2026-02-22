import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, fromEvent } from 'rxjs';
import { Router } from '@angular/router';
import { PointService } from './point.service';
import { hashPassword } from '../utils/hash.utils';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private userSubject = new BehaviorSubject<any>(this.getUserFromToken());
  public user$ = this.userSubject.asObservable();

  private readonly TOKEN_KEY = 'token';

  private pointService = inject(PointService);

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
    this.checkTokenOnStartup();
    this.setupStorageListener();
  }

  get isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired();
  }

  private setupStorageListener() {
    // Слушаем события storage от других вкладок
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === this.TOKEN_KEY) {
        this.ngZone.run(() => {
          this.handleTokenChange(event.oldValue, event.newValue);
        });
      }
    });

    setInterval(() => {
      this.ngZone.run(() => {
        const currentToken = localStorage.getItem(this.TOKEN_KEY);
        const storedToken = this.getStoredTokenSnapshot();

        if (currentToken !== storedToken) {
          this.handleTokenManipulation();
        } else if (currentToken && this.isTokenExpired()) {
          this.handleTokenExpired();
        }
      });
    }, 1000);
  }

  private getStoredTokenSnapshot(): string | null {
    // Получаем текущее значение из localStorage напрямую
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleTokenChange(oldValue: string | null, newValue: string | null) {
    console.log('Token changed in another tab:', { oldValue, newValue });

    if (newValue === null) {
      // Токен удален в другой вкладке
      this.logout('Token removed in another tab');
    } else if (oldValue !== newValue) {
      // Токен изменен в другой вкладке
      this.handleTokenManipulation('Token changed in another tab');
    }
  }

  private handleTokenManipulation(reason: string = 'Token was manipulated') {
    console.warn(reason);
    this.forceLogout('Сессия была изменена. Выполнен автоматический выход.');
  }

  private handleTokenExpired() {
    console.warn('Token expired');
    this.forceLogout('Срок действия сессии истек. Выполнен автоматический выход.');
  }

  private forceLogout(message: string) {
    localStorage.removeItem(this.TOKEN_KEY);
    this.userSubject.next(null);
    this.pointService.clearLocal();

    // Показываем сообщение пользователю
    if (this.router.url !== '/login') {
      this.router.navigate(['/login'], {
        queryParams: { sessionExpired: true, message: message }
      });
    }
  }

  login(credentials: any): Observable<any> {
    const hashedCredentials = {
      username: credentials.username,
      password: hashPassword(credentials.password)
    };
    return this.http.post(`${this.apiUrl}/login`, hashedCredentials).pipe(
      tap((res: any) => this.setSession(res))
    );
  }

  register(credentials: any): Observable<any> {
    const hashedCredentials = {
      username: credentials.username,
      password: hashPassword(credentials.password)
    };
    return this.http.post(`${this.apiUrl}/register`, hashedCredentials).pipe(
      tap((res: any) => this.setSession(res))
    );
  }

  logout(reason?: string) {
    localStorage.removeItem(this.TOKEN_KEY);
    this.userSubject.next(null);
    this.pointService.clearLocal();
    this.router.navigate(['/login'], {
      queryParams: reason ? { logoutReason: reason } : undefined
    });
  }

  private setSession(res: any) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    this.userSubject.next({ username: this.getUsernameFromToken() });
  }

  private getUserFromToken(): any {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token || this.isTokenExpired()) return null;

    try {
      const payload = this.decodeToken(token);
      return { username: payload.sub };
    } catch (e) {
      return null;
    }
  }

  private getUsernameFromToken(): string | null {
    const user = this.getUserFromToken();
    return user ? user.username : null;
  }

  private isTokenExpired(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (e) {
      return true;
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token');
      }

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode token', e);
      throw e;
    }
  }

  private checkTokenOnStartup() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token && !this.isTokenExpired()) {
      const username = this.getUsernameFromToken();
      this.userSubject.next({ username });
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      this.userSubject.next(null);
    }
  }
}
