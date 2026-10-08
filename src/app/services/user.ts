import {
  inject,
  Injectable,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AuthUser,
  UserRole,
} from './auth';

export type UpdateUserRequest = {
  role: UserRole;
  active: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http =
    inject(HttpClient);

  getUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(
      '/api/users',
    );
  }

  updateUser(
    userId: number,
    request: UpdateUserRequest,
  ): Observable<AuthUser> {
    return this.http.patch<AuthUser>(
      `/api/users/${userId}`,
      request,
    );
  }
}