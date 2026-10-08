import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = auth.getToken();

  const outgoingRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(outgoingRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !request.url.includes('/api/auth/login')
      ) {
        auth.clearSession();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};