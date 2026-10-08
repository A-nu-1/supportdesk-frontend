import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { Auth } from '../services/auth';

export const realAdminGuard: CanActivateFn =
  () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (auth.isRealAdmin()) {
      return true;
    }

    return router.createUrlTree([
      '/tickets',
    ]);
  };