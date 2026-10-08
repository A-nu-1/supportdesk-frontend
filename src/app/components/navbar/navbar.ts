import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  imports: [RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}