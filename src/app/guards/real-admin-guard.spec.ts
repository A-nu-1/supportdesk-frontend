import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { realAdminGuard } from './real-admin-guard';

describe('realAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => realAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
