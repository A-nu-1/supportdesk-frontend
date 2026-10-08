import {
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  tap,
} from 'rxjs';

export type UserRole =
  | 'EMPLOYEE'
  | 'SUPPORT_AGENT'
  | 'ADMIN';

export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  demo: boolean;
};

const TOKEN_KEY = 'supportdesk_token';
const USER_KEY = 'supportdesk_user';
const DEMO_KEY = 'supportdesk_demo';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);

  readonly currentUser =
    signal<AuthUser | null>(
      this.restoreUser(),
    );

  readonly demo = signal(
    this.restoreDemo(),
  );

  login(
    request: LoginRequest,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        '/api/auth/login',
        request,
      )
      .pipe(
        tap((response) => {
          this.saveSession(response);
        }),
      );
  }

  demoLogin(
    role: UserRole,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        '/api/auth/demo-login',
        { role },
      )
      .pipe(
        tap((response) => {
          this.saveSession(response);
        }),
      );
  }

  getToken(): string | null {
    return localStorage.getItem(
      TOKEN_KEY,
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  isRealAdmin(): boolean {
    return (
      this.currentUser()?.role ===
        'ADMIN' &&
      !this.demo()
    );
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    localStorage.removeItem(
      DEMO_KEY,
    );

    this.currentUser.set(null);
    this.demo.set(false);
  }

  private saveSession(
    response: LoginResponse,
  ): void {
    localStorage.setItem(
      TOKEN_KEY,
      response.token,
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(response.user),
    );

    localStorage.setItem(
      DEMO_KEY,
      String(response.demo),
    );

    this.currentUser.set(
      response.user,
    );

    this.demo.set(
      response.demo,
    );
  }

  private restoreUser():
    AuthUser | null {
    const token =
      localStorage.getItem(TOKEN_KEY);

    const storedUser =
      localStorage.getItem(USER_KEY);

    if (!token || !storedUser) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      localStorage.removeItem(
        TOKEN_KEY,
      );

      localStorage.removeItem(
        USER_KEY,
      );

      localStorage.removeItem(
        DEMO_KEY,
      );

      return null;
    }

    try {
      return JSON.parse(
        storedUser,
      ) as AuthUser;
    } catch {
      localStorage.removeItem(
        TOKEN_KEY,
      );

      localStorage.removeItem(
        USER_KEY,
      );

      localStorage.removeItem(
        DEMO_KEY,
      );

      return null;
    }
  }

  private restoreDemo(): boolean {
    return (
      localStorage.getItem(
        DEMO_KEY,
      ) === 'true'
    );
  }

  private isTokenExpired(
    token: string,
  ): boolean {
    try {
      const payloadPart =
        token.split('.')[1];

      if (!payloadPart) {
        return true;
      }

      const base64 = payloadPart
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(
        atob(base64),
      ) as {
        exp?: number;
      };

      if (!payload.exp) {
        return true;
      }

      return (
        payload.exp * 1000 <=
        Date.now()
      );
    } catch {
      return true;
    }
  }
}