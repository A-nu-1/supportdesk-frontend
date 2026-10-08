import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { realAdminGuard } from './guards/real-admin-guard';

import { Admin } from './pages/admin/admin';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { NewTicket } from './pages/new-ticket/new-ticket';
import { TicketDetail } from './pages/ticket-detail/ticket-detail';
import { Tickets } from './pages/tickets/tickets';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'tickets',
    component: Tickets,
    canActivate: [authGuard],
  },
  {
    path: 'tickets/new',
    component: NewTicket,
    canActivate: [authGuard],
  },
  {
    path: 'tickets/:id',
    component: TicketDetail,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, realAdminGuard],
  },
];
