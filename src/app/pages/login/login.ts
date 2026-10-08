import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth, UserRole } from '../../services/auth';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected login() {
    this.error.set('');
    this.loading.set(true);

    this.auth
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);

          console.log('Logged in user:', response.user);

          this.router.navigate(['/tickets']);
        },

        error: (error) => {
          this.loading.set(false);

          this.error.set(error.error?.error ?? 'Unable to sign in. Please check your credentials.');
        },
      });
  }
  protected demoLoading = signal<UserRole | null>(null);

  protected demoLogin(role: UserRole): void {
    if (this.demoLoading()) {
      return;
    }

    this.error.set('');
    this.demoLoading.set(role);

    this.auth.demoLogin(role).subscribe({
      next: () => {
        this.router.navigate(['/tickets']);
      },

      error: (error) => {
        this.demoLoading.set(null);

        this.error.set(error.error?.message ?? 'Demo login failed.');
      },
    });
  }
}
